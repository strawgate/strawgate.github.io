---
title: "From 1,200 tools to 8: reshaping OpenAPI-derived MCP servers so agents can actually use them"
description: "A dump of every OpenAPI endpoint into an MCP server is technically correct and practically useless. Here's the transformation layer I've been building into FastMCP — and why picking the right 8 tools beats exposing all 1,200."
pubDate: 2026-03-14
tags: ["MCP", "Tool Transformation"]
draft: false
---

The first time I pointed FastMCP at a real OpenAPI spec, it produced a perfectly correct MCP server with more than a thousand tools.

The server worked. The agent did not.

That project became the origin story for what we now call **tool transformation** in FastMCP — one of the features I've spent the most time on since [Jeremiah invited me to maintain the project](https://jlowin.dev/blog/fastmcp-bill-easton). The problem it solves is specific and, once you see it, kind of obvious. But I keep meeting teams who haven't seen it yet, so I want to write it down.

## The problem with being correct

OpenAPI specs are designed to be exhaustive. Every endpoint. Every HTTP verb. Every query parameter and optional flag, documented atomically, because that's what you want from an API reference. When you run that exhaustiveness through a naïve OpenAPI-to-MCP converter, you get the same thing back: one MCP tool per endpoint per verb.

That's not a tool surface. That's a phone book.

Agents don't reason well over a phone book. They spend their context budget reading tool descriptions. They pick the wrong tool because two similar endpoints were both plausible. They hit rate limits chasing pagination loops they shouldn't have started. They forget halfway through what they were doing.

Jeremiah put it better than I did:

> The original [OpenAPI] feature produced MCP servers that were poisoning agents with hundreds of atomic, context-free operations.

That phrase — *poisoning agents* — is right, and not rhetorical. It is a literal degradation of the agent's behavior caused by bad context. The model gets worse at its job proportional to how much junk you crammed into the tool list.

## What tool transformation actually does

The transformation layer in FastMCP sits between the tool list your converter produces and the tool list the agent sees. It lets you do four things:

1. **Filter.** Drop tools that aren't relevant to the job this agent is actually being asked to do. Most of those thousand endpoints are irrelevant — they're there because the API exposes them, not because this agent needs them.
2. **Combine.** A "search" flow is usually three or four endpoints pretending to be one operation. Collapse the sequence into a single tool the agent can call once.
3. **Rename.** Rewrite tool names and argument names to match how an agent — or a human — thinks about the domain. `list_events_v2_get` becomes `search_events`. Done.
4. **Transform.** Reshape individual arguments. Accept natural-language time ranges instead of ISO timestamps. Pre-fill parameters the user never needed to see. Reorder inputs so the important ones come first.

The goal is not to expose "all the capabilities." The goal is to give the agent **the smallest possible set of tools that still covers the job-to-be-done**, each one shaped the way a human collaborator would describe it.

## A concrete before-and-after

Here's the shape of what a transformation pipeline looks like in practice. Numbers below are illustrative — real surfaces vary by spec, and the pattern is what matters.

```python
# Before: every endpoint from the spec, dumped as-is
server = FastMCP.from_openapi(spec_url)
# Result: 1,247 tools. Agent drowns.

# After: an opinionated surface composed from the raw endpoints
server = (
    FastMCP.from_openapi(spec_url)
      .filter(lambda t: t.tag in ALLOWED_TAGS)
      .rename({"list_events_v2_get": "search_events"})
      .combine("create_and_start_deployment", [
          "create_deployment",
          "set_deployment_config",
          "start_deployment",
      ])
      .transform_argument("search_events", "time_range",
          lambda v: parse_natural_time(v))
)
# Result: 8 tools. Agent performs.
```

That final number — 8 — is the point. It could have been 12, or 6. It is almost never the right thing to be larger than "one per job-to-be-done plus a small handful of obvious modifiers."

## Why the "how many tools?" question is the wrong question

I get asked "what's the right number of tools for an MCP server?" often enough that I should probably just write a FAQ. The honest answer is: there's no number. The right number is "enough to cover the jobs this agent will actually do, and no more."

A company wiki with one well-shaped search tool can beat a 200-tool Jira wrapper for most knowledge work. A coding assistant with eight filesystem tools can beat a fifty-tool one for most editing tasks. The delta comes from the part of the agent's context that *isn't* being consumed by tool descriptions it will never use.

What the right number *is not* is "all of them." "All of them" is what you get from a naïve converter. "All of them" is what the agent pays for in context, in latency, in wrong-tool errors. "All of them" is a bug masquerading as a feature.

## The security-brain footnote

A thing that's easy to miss if you've only ever been an application developer, but obvious if you've ever been a security engineer: **every tool on your MCP server is an authenticated API endpoint that your agent is about to call on behalf of a user.**

That framing makes a lot of decisions downstream easier. You wouldn't hand a third-party contractor a list of 1,247 company endpoints and hope they pick the right one. You'd hand them a small set of sanctioned operations with the right arguments pre-filled and the dangerous knobs hidden.

Tool transformation is how you give the agent the same discipline. It's not only a quality problem; it's a blast-radius problem.

## How to think about it, if you're about to do this yourself

If you're pointing FastMCP (or any other OpenAPI-to-MCP tool) at a real spec:

1. **Start from the jobs, not the endpoints.** List the five to ten things you want an agent to be able to do.
2. **Map each job to the smallest set of raw endpoints that can accomplish it.** That's your tool.
3. **Name the tool after the job, not the endpoint.** `create_deployment` → `launch_environment`.
4. **Reshape arguments to match how an agent or user thinks about the domain.** If your agent thinks in "yesterday" and your API thinks in RFC 3339, close that gap in the transform layer, not in the agent's prompt.
5. **Only then look at what's left over.** Most of it stays off the server.

The transformation primitives exist to make this pattern one-import-away. If it isn't ergonomic for your use case yet, that's a FastMCP issue, not a you issue, and I want the bug report.

The code lives in [PrefectHQ/fastmcp](https://github.com/PrefectHQ/fastmcp). If you try this and something feels wrong, open an issue — odds are high that I wrote the relevant bit and can fix it.
