import { getRepo, formatCount } from './stats';

export interface Project {
  name: string;
  role: string;
  description: string;
  /** If set, the component will pull stars + archived status from stats.json at build time. */
  githubRepo?: string;
  /** Manual overrides or non-GitHub links */
  links: { label: string; href: string }[];
  /** Non-stars stat to display (e.g. downloads/day). Overrides auto-star display. */
  statLabel?: string;
  statValue?: string;
  featured?: boolean;
  category: 'current' | 'contributing' | 'past';
}

/**
 * Derived view of a Project merged with live stats from stats.json.
 * Use this shape in components.
 */
export interface ProjectWithLive extends Project {
  liveStars?: number;
  liveStarsFormatted?: string;
  liveArchived?: boolean;
  liveHtmlUrl?: string;
}

export const projects: Project[] = [
  // ---------- CURRENTLY MAINTAINED ----------
  {
    category: 'current',
    featured: true,
    name: 'FastMCP',
    role: 'Core maintainer · PrefectHQ/fastmcp',
    description:
      'The most popular Python framework for building Model Context Protocol servers. I’m one of two core maintainers, focused on Tool Transformation, MCP Sampling, Storage, and the server-wrapping layer that composes many MCP servers into one.',
    githubRepo: 'PrefectHQ/fastmcp',
    links: [{ label: 'github', href: 'https://github.com/PrefectHQ/fastmcp' }],
  },
  {
    category: 'current',
    name: 'py-key-value',
    role: 'Author & maintainer',
    description:
      'A top-1000 open-source Python library that unifies 15+ key-value stores behind one async interface, so frameworks can add storage without locking themselves to a backend.',
    githubRepo: 'strawgate/py-key-value',
    links: [
      { label: 'github', href: 'https://github.com/strawgate/py-key-value' },
      { label: 'pypi', href: 'https://pypi.org/project/py-key-value/' },
    ],
    // Downloads stat takes priority over star count for this card
    statLabel: 'downloads / day',
    statValue: 'auto',
  },
  {
    category: 'current',
    name: 'py-mcp-collection',
    role: 'Author',
    description:
      'A monorepo of focused MCP servers for coding agents: bulk filesystem operations with code summarization, local-references from project docs, a vector-search document store, and a proxy layer that reshapes third-party MCP servers.',
    githubRepo: 'strawgate/py-mcp-collection',
    links: [{ label: 'github', href: 'https://github.com/strawgate/py-mcp-collection' }],
  },
  {
    category: 'current',
    name: 'o11ykit',
    role: 'Author',
    description:
      'An observability toolkit for tracking OSS project health over time. It includes octo11y, a GitHub Actions pipeline that emits OTLP metrics for community, velocity, activity, and traffic. It powers the live stats on this site.',
    githubRepo: 'strawgate/o11ykit',
    links: [{ label: 'github', href: 'https://github.com/strawgate/o11ykit' }],
  },
  {
    category: 'current',
    name: 'BigFix C3 Content',
    role: 'Principal maintainer · 2016 – present',
    description:
      'Open-source Inventory, Security, and Compliance content for IBM BigFix. It runs in hundreds of organizations managing more than ten million endpoints across government, defense, finance, media, retail, and higher education.',
    links: [{ label: 'forum.bigfix.com', href: 'https://forum.bigfix.com/users/strawgate' }],
  },

  // ---------- CONTRIBUTING TO ----------
  {
    category: 'contributing',
    name: 'PydanticAI',
    role: 'Contributor',
    description:
      '7+ PRs expanding MCP support, Dynamic Tools, and Tool Calling. I also contributed FastMCPServerToolset so PydanticAI agents can consume any FastMCP server as a native toolset.',
    links: [{ label: 'pydantic/pydantic-ai', href: 'https://github.com/pydantic/pydantic-ai' }],
  },
  {
    category: 'contributing',
    name: 'LlamaIndex',
    role: 'Contributor',
    description:
      '19 PRs in 2024–2025 covering DuckDB support, FlashRerank integration, and performance work across indexing and retrieval.',
    links: [{ label: 'run-llama/llama_index', href: 'https://github.com/run-llama/llama_index' }],
  },
  {
    category: 'contributing',
    name: 'litellm & docling',
    role: 'Contributor',
    description:
      'PRs that improve interoperability across the AI tooling stack, usually by fixing friction I hit while building something else.',
    links: [
      { label: 'BerriAI/litellm', href: 'https://github.com/BerriAI/litellm' },
      { label: 'DS4SD/docling', href: 'https://github.com/DS4SD/docling' },
    ],
  },
  {
    category: 'contributing',
    name: 'Elasticsearch',
    role: 'Contributor',
    description:
      '2 PRs in ES|QL focused on query planning. I direct the Ingest portfolio, but I still pick up the keyboard where it matters.',
    links: [{ label: 'elastic/elasticsearch', href: 'https://github.com/elastic/elasticsearch' }],
  },

  // ---------- PAST / ARCHIVED ----------
  {
    category: 'past',
    name: 'fastmcp-agents',
    role: 'Author · archived, upstreamed',
    description:
      'Turned generic MCP servers into opinionated, agent-ready tools that killed tool sprawl. The core ideas now live in FastMCP’s tool transformation layer, so the project archived itself out of a job.',
    githubRepo: 'strawgate/fastmcp-agents',
    links: [{ label: 'github', href: 'https://github.com/strawgate/fastmcp-agents' }],
  },
  {
    category: 'past',
    name: 'filesystem-operations-mcp',
    role: 'Author · archived, superseded',
    description:
      'An MCP server that introduced bulk read, preview, and search primitives so coding agents could stop making dozens of sequential calls. I folded it into py-mcp-collection once the patterns stabilized.',
    githubRepo: 'strawgate/filesystem-operations-mcp',
    links: [{ label: 'github', href: 'https://github.com/strawgate/filesystem-operations-mcp' }],
  },
  {
    category: 'past',
    name: 'Log4Shell Detection',
    role: 'Author · 2022',
    description:
      'An open-source Log4j detection tool that used 90% fewer resources, ran 99% faster than incumbent scanners, and produced no false positives. More than 150 companies picked it up during the Log4Shell scramble.',
    links: [],
  },
  {
    category: 'past',
    name: 'NVD Error Coordination',
    role: 'Volunteer · NIST · 2022',
    description:
      'Worked with NIST to identify and correct thousands of errors in the National Vulnerability Database. Unglamorous work, but it made downstream scanners more trustworthy.',
    links: [],
  },
];

/**
 * Merge the static project list with live stats from stats.json.
 * Components should import this, not `projects` directly.
 */
export function getProjectsWithLive(): ProjectWithLive[] {
  return projects.map((p) => {
    if (!p.githubRepo) return p;
    const repo = getRepo(p.githubRepo);
    if (!repo) return p;

    const merged: ProjectWithLive = {
      ...p,
      liveStars: repo.stars,
      liveStarsFormatted: formatCount(repo.stars),
      liveArchived: repo.archived,
      liveHtmlUrl: repo.html_url,
    };

    // If this project wants the py-key-value download stat, resolve "auto"
    if (p.statValue === 'auto' && p.name === 'py-key-value') {
      const dl = rawPyPIDownloads?.['py-key-value-aio']?.last_day;
      if (dl) merged.statValue = formatCount(dl);
    }
    return merged;
  });
}

// Side imports kept here to avoid circular deps
import { stats } from './stats';
const rawPyPIDownloads = stats.pypi;

export const projectsByCategory = {
  current: projects.filter((p) => p.category === 'current'),
  contributing: projects.filter((p) => p.category === 'contributing'),
  past: projects.filter((p) => p.category === 'past'),
};
