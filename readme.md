# strawgate.com

Bill Easton's personal site. Built with [Astro 5](https://astro.build), markdown-powered, with live GitHub + PyPI stats refreshed daily.

This is **the populated version** — every page ships with real copy and every big number on the site is refreshed from source. You can `npm install && npm run build` and deploy as-is.

## Quick start

```sh
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # static output in ./dist
npm run preview  # serve the built output
npm run stats    # refresh src/data/stats.json from GitHub + PyPI
```

## Live stats pipeline

The site reads headline numbers from `src/data/stats.json`, which is refreshed daily by a GitHub Actions workflow. Unlike hardcoded numbers, these stay accurate without manual work.

**What's tracked** (see `scripts/refresh-stats.mjs`):

- **User-level** (from GitHub REST + Search):
  - public_repos, followers
  - merged PR count (all-time, current year, previous year) across all of GitHub
- **Per-repo** (from GitHub REST) for a curated list in `TRACKED_REPOS`:
  - stars, forks, open issues, open PRs, archived status, last pushed
  - current list: PrefectHQ/fastmcp, strawgate/py-key-value, strawgate/py-mcp-collection, strawgate/fastmcp-agents, strawgate/filesystem-operations-mcp, strawgate/es-knowledge-base-mcp, strawgate/augmented-infrastructure, strawgate/o11ykit
- **PyPI downloads** (from pypistats.org) for py-key-value-aio
  - last_day, last_week, last_month

**What surfaces where:**

- `src/components/FactsRow.astro` — the four big numbers on Home and About. Mix of static ($200M Verve exit, 1-of-2 FastMCP maintainers) and live (py-key-value daily downloads, lifetime OSS PRs).
- `src/components/ProjectGrid.astro` — per-repo stars and archived badges, looked up by `githubRepo` field in each project.

**How refreshes happen:**

- Automatic: `.github/workflows/refresh-stats.yml` runs daily at 06:00 UTC, executes `npm run stats`, commits `src/data/stats.json` if anything changed.
- Manual, local: `npm run stats` (optionally with `GITHUB_TOKEN=…` for higher rate limits).
- Manual, from GitHub: trigger the "Refresh site stats" workflow via `workflow_dispatch`.

**Resilience:**

- The script uses `Promise.allSettled` — a failure in one section (e.g., PyPI rate limiting) doesn't wipe other sections.
- PyPI values are preserved per-package on fetch failure, so transient 429s don't zero out the daily-downloads number.
- If the entire script fails, the committed `stats.json` from the previous run stays live.

**Extending with octo11y:**

The workflow includes a commented-out job stub for `strawgate/octo11y/actions/repo-stats`. Uncomment it when you want deeper per-repo time-series (velocity, traffic, language-bytes-over-time) stored to a `bench-data` branch. The current pipeline gives you snapshot numbers; octo11y adds trend lines.

## Cutover checklist

Before the first real deploy:

- [x] Publish the flagship post at `src/content/posts/openapi-tool-transformation.md`.
- [x] Standardize the public contact address to `bill@strawgate.com`.
- [ ] Add `public/resume.pdf` if you want a downloadable PDF alongside the HTML resume.
- [ ] Review `src/pages/talks.astro` and add any talks you want to feature beyond the AWS re:Invent 2024 Serverless launch and ElasticON keynote entry.
- [ ] Review `src/pages/uses.astro` and swap any tooling details you want to personalize further.
- [ ] Push the repo to GitHub.
- [ ] In GitHub repo settings, set Pages to use GitHub Actions.
- [ ] Point `strawgate.com` DNS at GitHub Pages.
- [ ] Either let the scheduled workflow refresh stats once, or run `npm run stats` locally and commit the result.

## Pages

| Path | File | What it is |
|---|---|---|
| `/` | `src/pages/index.astro` | Home — hero, recent posts, current projects, about preview, live facts row |
| `/writing` | `src/pages/writing/index.astro` | Blog index |
| `/writing/[slug]` | `src/pages/writing/[...slug].astro` | Individual post route |
| `/projects` | `src/pages/projects.astro` | Full project list: Currently maintained / Contributing to / Past work |
| `/talks` | `src/pages/talks.astro` | Keynotes and conference talks, topics, speaking contact |
| `/about` | `src/pages/about.astro` | Full bio + live facts row |
| `/uses` | `src/pages/uses.astro` | Editor, languages, AI stack, observability, hardware |
| `/resume` | `src/pages/resume.astro` | HTML CV |
| `/disclosures` | `src/pages/disclosures.astro` | Public and embargoed security disclosures, grouped by year |
| `/404` | `src/pages/404.astro` | Custom 404 with sensible starting destinations |
| `/rss.xml` | `src/pages/rss.xml.js` | RSS feed |

**Top nav** (primary): Writing, Projects, Talks, About.
**Footer** (secondary): Uses, Resume, Disclosures, plus contact links.

## Where to edit what

### Positioning / hero

- **Headline and lede:** `src/components/Hero.astro`. The `<em>` tag gets the accent italic treatment.
- **Facts row:** `src/components/FactsRow.astro`. Each item has a `live` flag — live values are pulled from stats.json; static values are hardcoded.
- **Nav items:** `src/components/TopNav.astro`.
- **Footer links:** `src/components/SiteFooter.astro`.

### Content

- **Blog posts:** `src/content/posts/*.md`. Frontmatter schema:

  ```yaml
  ---
  title: "Post title"
  description: "Appears in the post list and as SEO description."
  pubDate: 2026-04-24
  tags: ["MCP", "Tool Transformation"]
  draft: false
  ---
  ```

  Posts with `draft: true` are hidden from the list, their own page, and RSS.

- **Projects:** `src/data/projects.ts`. One typed array. Each project may include a `githubRepo: 'owner/name'` to pull stars and archived status automatically from stats.json.

- **Disclosures:** `src/pages/disclosures.astro` — array at the top of the file.

- **About narrative:** `src/pages/about.astro`.

### Design tokens

CSS custom properties at the top of `src/styles/global.css`:

```css
--bg: #FAFAF7;
--bg-warm: #F4F2EC;
--ink: #1A1A1A;
--ink-soft: #3F3F3A;
--ink-muted: #7A7870;
--rule: #E4E1D8;
--accent: #A8442A;      /* terracotta accent */

--font-display: 'Instrument Serif', Georgia, serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
```

## Deploying

### Cloudflare Pages (recommended)

1. Push to GitHub.
2. Cloudflare dashboard → Pages → Create → Connect to GitHub → select repo.
3. Build command: `npm run build`. Output dir: `dist`. Env var: `NODE_VERSION=20`.
4. Add `strawgate.com` in the project's Custom domains tab.

Deploys on push to the production branch you configure in Cloudflare. Preview deploys on PRs.

### GitHub Pages

`.github/workflows/deploy.yml` is wired up. After pushing:

1. Repo settings → Pages → Source: GitHub Actions.
2. `public/CNAME` already contains `strawgate.com`.
3. Point DNS per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

### Vercel

```sh
npm install -g vercel
vercel
```

Astro is a first-class framework. Zero config.

## What's intentionally not included

- **Dark mode toggle** — later, if ever.
- **Newsletter signup** — wait until there are 3–4 posts up.
- **Analytics** — add Plausible/Fathom/Cloudflare Web Analytics via a single script tag in `BaseLayout.astro` when you want it.
- **Client-side search** — add it if the writing archive gets large enough to need it.

## License

All content © William Easton. Scaffolding code is MIT.
