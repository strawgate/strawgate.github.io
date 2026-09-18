export interface PydanticPost {
  title: string;
  slug: string;
  published: string;
  readTime: string;
  category: 'Pydantic AI' | 'Pydantic Logfire';
}

// Canonical metadata lives at https://pydantic.dev/authors/bill-easton/ and in
// pydantic/pydantic.dev. Keep this static so a Pydantic outage cannot break the
// personal-site build; the full-archive link remains current between refreshes.
export const pydanticPosts: PydanticPost[] = [
  {
    title: 'The best Langfuse alternatives in 2026, honestly compared',
    slug: 'best-langfuse-alternatives',
    published: '2026-08-26',
    readTime: '12 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The 7 best LLM evaluation tools in 2026',
    slug: 'best-llm-evaluation-tools',
    published: '2026-08-26',
    readTime: '12 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The best OpenTelemetry backends in 2026, honestly compared',
    slug: 'best-opentelemetry-backends',
    published: '2026-08-26',
    readTime: '9 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The best prompt management tools in 2026',
    slug: 'best-prompt-management-tools',
    published: '2026-08-26',
    readTime: '12 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The best Sentry alternatives in 2026, honestly compared',
    slug: 'best-sentry-alternatives',
    published: '2026-08-21',
    readTime: '7 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Do evals the Airbnb way',
    slug: 'three-layer-evals-logfire',
    published: '2026-08-06',
    readTime: '10 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Fork the loop',
    slug: 'switching-from-braintrust',
    published: '2026-08-05',
    readTime: '5 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Focus on evals with Logfire',
    slug: 'focus-on-evals-with-logfire',
    published: '2026-08-04',
    readTime: '7 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Score freely',
    slug: 'braintrust-week',
    published: '2026-08-03',
    readTime: '5 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The best AI platform for building agents on Kubernetes in 2026',
    slug: 'best-ai-platform-agents-kubernetes',
    published: '2026-07-30',
    readTime: '11 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The best AI agent optimization platforms in 2026',
    slug: 'best-ai-agent-optimization-platforms-2026',
    published: '2026-07-29',
    readTime: '10 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Ten agents, ten clouds, one answer',
    slug: 'harness-localstack',
    published: '2026-07-24',
    readTime: '6 min',
    category: 'Pydantic AI',
  },
  {
    title: 'The agent outgrew your laptop',
    slug: 'harness-modal',
    published: '2026-07-23',
    readTime: '6 min',
    category: 'Pydantic AI',
  },
  {
    title: 'The agent writes faster than you can review',
    slug: 'harness-macroscope',
    published: '2026-07-22',
    readTime: '7 min',
    category: 'Pydantic AI',
  },
  {
    title: 'A research agent, three ways',
    slug: 'harness-exa',
    published: '2026-07-21',
    readTime: '7 min',
    category: 'Pydantic AI',
  },
  {
    title: 'Your traces already know how to fix your prompt',
    slug: 'logfire-prompt-optimization',
    published: '2026-07-17',
    readTime: '7 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Score Freely with Pydantic Logfire',
    slug: 'logfire-annotations',
    published: '2026-07-16',
    readTime: '5 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'One key in, no keys out',
    slug: 'logfire-ai-gateway',
    published: '2026-07-15',
    readTime: '6 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The average run is lying to you',
    slug: 'logfire-agents-llms-view',
    published: '2026-07-14',
    readTime: '6 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'You perfected the wrong agent',
    slug: 'agents-week',
    published: '2026-07-13',
    readTime: '6 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'When you do not know what you are looking for',
    slug: 'logfire-metrics-explorer',
    published: '2026-06-19',
    readTime: '5 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'The OOM that was not your agent',
    slug: 'logfire-hosts-view',
    published: '2026-06-18',
    readTime: '4 min',
    category: 'Pydantic Logfire',
  },
  {
    title: "The pod that did not survive Tuesday's deploy",
    slug: 'logfire-kubernetes-view',
    published: '2026-06-17',
    readTime: '5 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'When the slow thing is not the model',
    slug: 'logfire-services-view',
    published: '2026-06-16',
    readTime: '6 min',
    category: 'Pydantic Logfire',
  },
  {
    title: 'Agents are the new services',
    slug: 'agents-are-the-new-services',
    published: '2026-06-15',
    readTime: '6 min',
    category: 'Pydantic Logfire',
  },
];

export const pydanticAuthorUrl = 'https://pydantic.dev/authors/bill-easton/';

export function pydanticPostUrl(slug: string): string {
  return `https://pydantic.dev/articles/${slug}/`;
}
