/**
 * Typed loader for src/data/stats.json.
 *
 * All site components that want live stats should import from here — not from
 * stats.json directly. This gives us one place to:
 *   - apply types
 *   - define fallbacks for missing/stale fields
 *   - derive formatted strings (e.g., "800k" from 812000)
 *
 * The JSON is refreshed by scripts/refresh-stats.mjs (daily via GitHub Actions).
 */

import rawStats from './stats.json';

export interface UserStats {
  login: string;
  name: string;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface PrStats {
  all_time: number;
  this_year: number;
  last_year: number;
  year: number;
}

export interface RepoStats {
  full_name: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  open_prs: number;
  archived: boolean;
  pushed_at: string;
  default_branch: string;
  html_url: string;
}

export interface PyPIStats {
  last_day: number | null;
  last_week: number | null;
  last_month: number | null;
}

export interface SiteStats {
  generated_at: string;
  user: UserStats;
  prs: PrStats;
  repos: RepoStats[];
  pypi: Record<string, PyPIStats>;
  aggregates: {
    tracked_repos_count: number;
    total_stars_tracked: number;
  };
}

export const stats: SiteStats = rawStats as SiteStats;

// ----------------------------------------------------------
// Formatters
// ----------------------------------------------------------

/**
 * Format a count as "1.2k", "14.2k", "800k", "1.2M" — never shows decimals for <1k.
 */
export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/**
 * Freshness label for the generated_at timestamp — "updated 3 days ago" style.
 */
export function freshnessLabel(isoDate: string = stats.generated_at): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffHours = (now - then) / (1000 * 60 * 60);
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  const diffDays = diffHours / 24;
  if (diffDays < 7) return `${Math.round(diffDays)}d ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)}w ago`;
  return `${Math.round(diffDays / 30)}mo ago`;
}

// ----------------------------------------------------------
// Selectors
// ----------------------------------------------------------

/**
 * Look up a repo's live stats by full_name (e.g., "strawgate/py-key-value").
 * Returns null if not tracked.
 */
export function getRepo(fullName: string): RepoStats | null {
  return stats.repos.find((r) => r.full_name === fullName) ?? null;
}

/**
 * Look up a repo by short name (everything after the slash).
 * First match wins if multiple orgs use the same name.
 */
export function getRepoByName(name: string): RepoStats | null {
  return stats.repos.find((r) => r.name === name) ?? null;
}

/**
 * Daily downloads for a PyPI package, formatted.
 */
export function getDailyDownloads(pkg: string): string {
  const count = stats.pypi[pkg]?.last_day;
  return formatCount(count);
}

/**
 * Total stars summed across all tracked repos.
 */
export function getTotalStars(): number {
  return stats.aggregates.total_stars_tracked;
}
