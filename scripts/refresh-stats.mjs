#!/usr/bin/env node
/**
 * scripts/refresh-stats.mjs
 *
 * Scrapes GitHub + PyPI to produce:
 *   - src/data/stats.json       — curated per-repo stats + aggregates
 *   - src/data/star-history.json — nightly star total snapshots for timeline
 *
 * What it fetches:
 *   - User profile: public_repos, followers
 *   - ALL repos (paginated) to compute true total stars across account
 *   - Merged PR counts (all-time and current-year) via GitHub Search API
 *   - Per-repo stats for a curated list (stars, forks, open issues, open PRs, archived, pushed_at)
 *   - PyPI download stats for all published packages
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/refresh-stats.mjs
 *   (Or drop the token for unauthenticated — rate-limited to 10 search reqs/min.)
 *
 * Output:
 *   Writes stats.json and star-history.json, preserving existing data on per-field failure.
 *
 * Star history is self-seeded: every run appends a snapshot to star-history.json.
 * Over time this builds a dataset for the star timeline on the homepage.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATS_PATH = path.join(__dirname, '..', 'src', 'data', 'stats.json');
const STAR_HISTORY_PATH = path.join(__dirname, '..', 'src', 'data', 'star-history.json');

const GITHUB_USER = 'strawgate';

// Curated list of repos to pull per-repo stats for (display on projects page).
const TRACKED_REPOS = [
  'PrefectHQ/fastmcp',
  'strawgate/py-key-value',
  'strawgate/py-mcp-collection',
  'strawgate/fastmcp-agents',
  'strawgate/filesystem-operations-mcp',
  'strawgate/es-knowledge-base-mcp',
  'strawgate/augmented-infrastructure',
  'strawgate/o11ykit',
];

// All PyPI packages published by strawgate (found via pypi.org/simple).
const PYPI_PACKAGES = ['py-key-value-aio', 'strawgate-es-mcp'];

// ----------------------------------------------------------

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'strawgate.com-stats-refresher',
  ...(token && { Authorization: `Bearer ${token}` }),
};

async function gh(url) {
  const res = await fetch(`https://api.github.com${url}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub ${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function pypi(pkg) {
  // pypistats.org is the community endpoint for download stats.
  const res = await fetch(`https://pypistats.org/api/packages/${pkg}/recent`);
  if (!res.ok) {
    throw new Error(`PyPI ${pkg} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ----------------------------------------------------------

async function fetchUserProfile() {
  const user = await gh(`/users/${GITHUB_USER}`);
  return {
    login: user.login,
    name: user.name,
    public_repos: user.public_repos,
    followers: user.followers,
    created_at: user.created_at,
  };
}

async function fetchMergedPrCount(query) {
  const res = await gh(`/search/issues?q=${encodeURIComponent(query)}&per_page=1`);
  return res.total_count;
}

async function fetchPrCounts() {
  const year = new Date().getFullYear();
  const [allTime, thisYear, lastYear] = await Promise.all([
    fetchMergedPrCount(`is:pr is:merged author:${GITHUB_USER}`),
    fetchMergedPrCount(`is:pr is:merged author:${GITHUB_USER} created:${year}-01-01..${year}-12-31`),
    fetchMergedPrCount(
      `is:pr is:merged author:${GITHUB_USER} created:${year - 1}-01-01..${year - 1}-12-31`
    ),
  ]);
  return { all_time: allTime, this_year: thisYear, last_year: lastYear, year };
}

async function fetchOpenPrCount(fullName) {
  return fetchMergedPrCount(`repo:${fullName} is:pr is:open`);
}

async function fetchRepoStats(fullName) {
  const [repo, openPrs] = await Promise.all([
    gh(`/repos/${fullName}`),
    fetchOpenPrCount(fullName).catch(() => 0),
  ]);
  return {
    full_name: repo.full_name,
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    // GitHub's open_issues_count includes pull requests; split them back out.
    open_issues: Math.max(repo.open_issues_count - openPrs, 0),
    open_prs: openPrs,
    archived: repo.archived,
    pushed_at: repo.pushed_at,
    default_branch: repo.default_branch,
    html_url: repo.html_url,
  };
}

async function fetchAllRepos() {
  let page = 1;
  const perPage = 100;
  const allRepos = [];
  while (true) {
    const repos = await gh(`/users/${GITHUB_USER}/repos?per_page=${perPage}&page=${page}&sort=pushed`);
    if (!repos || repos.length === 0) break;
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }
  return allRepos;
}

async function fetchAllRepoStats() {
  const results = await Promise.allSettled(TRACKED_REPOS.map(fetchRepoStats));
  const out = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      out.push(r.value);
    } else {
      console.warn(`  [warn] failed ${TRACKED_REPOS[i]}: ${r.reason?.message || r.reason}`);
    }
  }
  return out;
}

async function fetchTotalStars(allRepos) {
  return allRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
}

async function appendStarHistory(totalStars, existingHistory = []) {
  const today = new Date().toISOString().split('T')[0];
  const lastEntry = existingHistory[existingHistory.length - 1];
  if (lastEntry?.date === today) {
    existingHistory[existingHistory.length - 1] = { date: today, stars: totalStars };
  } else {
    existingHistory.push({ date: today, stars: totalStars });
  }
  return existingHistory.slice(-365);
}

async function fetchPyPIStats(existing = {}) {
  // Start from existing so per-package failures don't wipe good data.
  const stats = { ...existing };
  for (const pkg of PYPI_PACKAGES) {
    try {
      const data = await pypi(pkg);
      stats[pkg] = {
        last_day: data.data?.last_day ?? null,
        last_week: data.data?.last_week ?? null,
        last_month: data.data?.last_month ?? null,
      };
    } catch (e) {
      console.warn(`  [warn] PyPI ${pkg}: ${e.message} — keeping previous value`);
      // Preserve existing[pkg] by not overwriting
    }
  }
  return stats;
}

// ----------------------------------------------------------

async function loadExistingStats() {
  try {
    const raw = await fs.readFile(STATS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mergeWithFallback(fresh, existing, key) {
  return fresh !== null && fresh !== undefined ? fresh : existing?.[key];
}

// ----------------------------------------------------------

async function main() {
  console.log(`Refreshing stats for ${GITHUB_USER}${token ? '' : ' (unauthenticated)'}`);
  if (!token) {
    console.log(
      '  [info] no GITHUB_TOKEN — rate limits are strict. Pass GITHUB_TOKEN for full fidelity.'
    );
  }

  const existing = await loadExistingStats();

  // Run all scrapes in parallel, catching individual failures.
  // Pass existing pypi into the fetcher so per-package failures don't wipe good data.
  const results = await Promise.allSettled([
    fetchUserProfile(),
    fetchPrCounts(),
    fetchAllRepos(),
    fetchAllRepoStats(),
    fetchPyPIStats(existing?.pypi ?? {}),
  ]);

  const [userRes, prsRes, allReposRes, reposRes, pypiRes] = results;

  const allRepos = allReposRes.status === 'fulfilled' ? allReposRes.value : [];
  const totalStars = allRepos.length > 0
    ? await fetchTotalStars(allRepos)
    : (existing?.aggregates?.total_stars_all ?? 0);

  const stats = {
    generated_at: new Date().toISOString(),
    user: userRes.status === 'fulfilled' ? userRes.value : existing?.user ?? null,
    prs: prsRes.status === 'fulfilled' ? prsRes.value : existing?.prs ?? null,
    repos: reposRes.status === 'fulfilled' ? reposRes.value : existing?.repos ?? [],
    pypi: pypiRes.status === 'fulfilled' ? pypiRes.value : existing?.pypi ?? {},
  };

  // Surface any failures for logging but still write whatever we got
  results.forEach((r, i) => {
    const name = ['user', 'prs', 'repos', 'pypi'][i];
    if (r.status === 'rejected') {
      console.warn(`  [warn] ${name} fetch failed: ${r.reason?.message || r.reason}`);
    }
  });

  // Derived aggregates (computed here rather than in the site code)
  const trackedStars = stats.repos.reduce((sum, r) => sum + (r.stars || 0), 0);
  stats.aggregates = {
    tracked_repos_count: stats.repos.length,
    total_stars_tracked: trackedStars,
    total_stars_all: totalStars,
  };

  // Append star history snapshot
  let starHistory = [];
  try {
    const raw = await fs.readFile(STAR_HISTORY_PATH, 'utf8');
    starHistory = JSON.parse(raw);
  } catch {
    // Fresh file
  }
  starHistory = await appendStarHistory(totalStars, starHistory);

  await fs.mkdir(path.dirname(STATS_PATH), { recursive: true });
  await fs.writeFile(STATS_PATH, JSON.stringify(stats, null, 2) + '\n', 'utf8');
  await fs.writeFile(STAR_HISTORY_PATH, JSON.stringify(starHistory, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${path.relative(process.cwd(), STATS_PATH)}`);
  console.log(`Wrote ${path.relative(process.cwd(), STAR_HISTORY_PATH)} (${starHistory.length} data points)`);
  console.log(`  public repos:        ${stats.user?.public_repos ?? '?'}`);
  console.log(`  followers:           ${stats.user?.followers ?? '?'}`);
  console.log(`  merged PRs total:    ${stats.prs?.all_time ?? '?'}`);
  console.log(
    `  merged PRs ${stats.prs?.year ?? '?'}:      ${stats.prs?.this_year ?? '?'}  (vs ${stats.prs?.last_year ?? '?'} prior year)`
  );
  console.log(`  total stars (all):   ${totalStars}`);
  console.log(`  total stars (tracked): ${trackedStars}`);
  console.log(`  tracked repos:       ${stats.repos.length}`);
  for (const pkg of Object.keys(stats.pypi ?? {})) {
    console.log(
      `  ${pkg}/day: ${stats.pypi[pkg].last_day ?? '?'}   week: ${stats.pypi[pkg].last_week ?? '?'}   month: ${stats.pypi[pkg].last_month ?? '?'}`
    );
  }
}

main().catch((e) => {
  console.error('refresh-stats failed:', e);
  process.exit(1);
});
