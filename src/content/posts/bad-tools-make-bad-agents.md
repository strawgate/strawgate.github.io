---
title: "Bad Tools Make Bad Agents"
description: "Most agent failures are not model failures. They are tool-shaping failures. If your tools are generic, leaky, or poorly scoped, your prompt turns into a compensating control system."
pubDate: 2025-05-24
tags: ["MCP", "Tool Design", "Agents"]
draft: false
---

_Adapted from my original [FastMCP discussion](https://github.com/PrefectHQ/fastmcp/discussions/591) that kicked off the work around tool rewriting and agents-as-tools._

Bad tools make bad agents.

That sounds obvious once you say it out loud, but it took me a while to realize how much of agent engineering was really just tool-shaping work in disguise.

When an agent performs badly, we tend to blame the model first. Maybe it needed a better prompt. Maybe the instructions were unclear. Maybe we chose the wrong model family.

Sometimes that is true.

But a shocking amount of the time the real problem is simpler: you gave the model the wrong tool surface.

## Tool definitions are part of the prompt whether you like it or not

Every MCP tool comes with a name, a description, and a schema. In practice, that means every tool also comes with a little chunk of world-model that you are injecting directly into the agent.

If that tool description is sloppy, misleading, too generic, too powerful, or just weirdly shaped, the agent absorbs all of that.

You do not have to write a bad system prompt to create a confused agent. You can do it just by mounting the wrong tools.

## Problem 1: bad tools poison good agents

The easiest version of this problem is the broken-example problem.

Imagine a time-conversion tool whose documentation includes an invalid timezone example like `America/San_Francisco`.

The tool may still work perfectly if called correctly. But the agent has now been shown a bad example right in the place it is most likely to imitate. So every time it tries to solve a west-coast scheduling problem, it is more likely to call the tool incorrectly.

Nothing is wrong with the model's general reasoning. Nothing is wrong with the outer prompt. The defect is in the interface the model learned from.

That matters because the standard workaround is ugly. You start patching the system prompt with special instructions:

1. Use the tool.
2. But ignore this part of the description.
3. Do not use that example value.
4. Translate this invalid thing into the real thing first.

At that point your prompt is not describing the task anymore. It is compensating for the tool.

That is a design smell.

## Problem 2: generic tools create prompt debt

The next failure mode is broader.

Suppose your agent has access to a pile of third-party tools that are each technically useful but only vaguely aligned with the job in front of it. Search issues. Query Salesforce. Read files. Query Elasticsearch. Write a comment. Repeat that pattern across enough servers and suddenly the agent has a hundred shiny options.

This is where people fall into what I think of as PromptOps.

You start writing giant instructions that explain:

1. Which tools to use for which tasks.
2. Which ones not to use.
3. What order to call them in.
4. How much data is safe to ask for.
5. Which weird corner cases each tool has.

Now your prompt is not a task description. It is a fragile operator manual for a messy warehouse of capabilities.

And because prompts are copy-pasted more easily than design is fixed, that debt spreads. Every new agent gets the same long warning label attached to it.

The result is predictable: agents get distracted, over-call tools, pull back too much context, and fail for reasons that look like model weakness but are really interface weakness.

## Problem 3: specialized tools don't scale either

A natural reaction is to do the opposite.

Instead of giving the agent one hundred tools, give it only four. Better yet, make those four extremely specialized. Hard-code the issue number. Hard-code the customer. Hard-code the index. Hard-code exactly what the agent is allowed to do.

That works, right up until you realize you have abandoned the whole premise of a reusable MCP ecosystem.

If every successful deployment requires writing one-off wrapper tools for every specific task, then third-party MCP servers are not really giving you leverage. They are just raw material for more bespoke engineering.

That is not where I wanted the ecosystem to end up.

## The missing middle layer is tool rewriting

What I wanted was something in between generic chaos and bespoke wrappers.

I wanted to be able to take an existing third-party tool and reshape it for the job at hand without rewriting the whole server.

That means being able to do things like:

1. Rewrite names and descriptions so they match the task.
2. Fix bad examples and bad docs.
3. Insert defaults or mandatory values.
4. Hard-scope parameters when the agent should only operate on one issue, one customer, or one environment.
5. Limit output size so the tool cannot blow the agent's context budget.
6. Apply pre- and post-processing so the agent sees the right interface instead of the raw one.

That is the real value of tool rewriting.

It is not just a convenience feature. It is the layer where you turn a technically available capability into an actually usable one.

This is also why I keep pushing on the idea that tool design is security design and quality design at the same time. A badly scoped tool is not only harder for the model to use well. It expands blast radius.

## Agents-as-tools solve a different but related problem

The second half of the original idea was agents-as-tools.

The problem there is not just that tools are poorly shaped. It is that some domains really do require local expertise about how to use a cluster of tools well.

You can teach every outer agent how to search GitHub correctly, how to constrain file reads, how to avoid giant result sets, how to stitch multi-step retrieval together, and how to summarize it all.

Or you can put that expertise behind one higher-level tool.

That is the move.

Instead of exposing every primitive directly, you expose a specialist agent as just another tool. Now the caller asks for `find_related_issues` instead of learning GitHub query syntax. It asks a filesystem agent to locate and classify files instead of manually orchestrating a dozen reads.

The outer agent stays focused on the user's task. The inner agent owns the local tool expertise.

## Why this mattered to me

This was not an abstract framework preference.

I kept seeing teams mount tools into agents as if the availability of a capability was the same thing as a usable capability.

It is not.

A tool can be valid and still be wrong for the agent.

A tool can be powerful and still be shaped badly enough to degrade performance.

A tool can be technically reusable and still require so much prompt scaffolding that the reuse is mostly fiction.

Once I started looking at the problem this way, a lot of agent engineering stopped looking like prompt engineering and started looking like interface design.

## The rule I use now

If an agent needs a giant prompt to explain how to safely and effectively use a tool, the tool is probably the problem.

That does not mean the model is never the bottleneck. It means you should not let model selection distract you from the fact that interfaces are policy.

The right question is not just "what can this tool do?"

The better question is "what shape of tool gives the agent the best chance of succeeding at the actual job?"

That usually means smaller surfaces, better names, narrower scope, safer defaults, and richer behavior hidden behind cleaner abstractions.

## This is still how I think about MCP

The ecosystem has moved fast since that original discussion, but the core idea still feels right to me.

MCP is most useful when it lets us compose real capabilities without forcing every agent author to become an expert in every underlying API.

To get there, we need more than raw tool exposure.

We need a shaping layer.

We need good defaults.

We need the ability to wrap generic tools into task-shaped tools.

And sometimes we need agents behind the tools, not just tools behind the agents.

That is the architecture I was arguing for then.

It is still the architecture I want now.