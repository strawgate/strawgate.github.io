---
title: "Agent Builder, Beyond The Chatbox: Introducing Augmented Infrastructure"
description: "We built an agent that does more than talk about infrastructure. It can reach into real environments, call tools through runners, and close the loop with Elasticsearch."
pubDate: 2026-01-22
tags: ["Agentic AI", "Infrastructure", "Elastic", "MCP"]
draft: false
---

_Originally published on [Elastic Search Labs](https://www.elastic.co/search-labs/blog/agent-builder-augmented-infrastructure)._ This version is adapted for this site.

Most agents still live in what I think of as the call-center phase.

They can summarize a runbook. They can explain a Kubernetes concept. They can tell you what command you should probably run next. But when the outage is live and the clock is running, they stop right at the line where work begins.

They talk about infrastructure. They do not touch it.

For DevOps, SRE, and security work, that is the wrong stopping point.

We wanted something else: an agent that understands the difference between talking about Kubernetes and configuring Kubernetes.

That project became **Augmented Infrastructure**.

## The real problem was never the answer

The failure mode we kept coming back to was simple:

1. The user asks for help.
2. The agent explains what to do.
3. The human copies the output.
4. The human reformats it for their environment.
5. The human pastes it into the shell, cloud console, or deployment system.

That is a surprisingly leaky boundary.

Every copy-paste step is friction. Every translation step is another opportunity for the human and the machine to drift apart. And every time the agent stops at advice instead of execution, the user is stuck acting as the transport layer between intent and infrastructure.

We wanted to get rid of that handoff.

## The core idea

We built the system on top of Elastic Agent Builder.

Agent Builder already provides the bridge between an LLM and private data in Elasticsearch. That is enough for a strong conversational system. It becomes much more interesting once you push hard on the tool layer.

The question was: what happens if the agent can do more than query data? What happens if it can route work to tools that live inside real environments?

That is where the architecture started.

## First version: make the outside world reachable

The earliest version was deliberately crude.

We wrote lightweight runner software that lived close to the environment we wanted to act on. Those runners polled for work, executed tool calls locally, and sent results back.

Bill the FastMCP maintainer showed up here in exactly the predictable way: I started wiring FastMCP clients into the runner so it could mount MCP servers and expose their tools to the broader system.

That first pass proved the idea, but it had two ugly problems:

1. The conversation got polluted with raw tool-call payloads.
2. Tool execution was bottlenecked by the chat roundtrip, because the request became visible only after the model had already responded.

The architecture worked. The user experience did not.

## The breakthrough was moving tool execution out of the conversation stream

The better version came from treating tool execution like infrastructure work instead of chat decoration.

We introduced a workflow-based handoff:

1. The agent emits a structured external tool request.
2. A workflow stores that request in Elasticsearch and returns an ID.
3. Runners poll the request index directly.
4. They execute locally in the target environment.
5. They write results back into Elasticsearch.
6. The agent reads those results and decides the next step.

That changes everything.

The chat history stays readable. Tool calls can begin while the model is still thinking. Multiple actions can happen inside a single conversational turn. The system stops feeling like a toy demo with shell access and starts feeling like a distributed operations surface.

## The architecture in one pass

Once the pieces settled, the system looked like this:

1. **Runners in target environments.** Lightweight workers live inside servers, Kubernetes clusters, or cloud accounts.
2. **Capability discovery through Elasticsearch.** The agent uses ES|QL and related retrieval to understand what tools are available in which environment.
3. **Workflow orchestration.** The agent turns intent into structured work requests.
4. **Execution and feedback.** Runners perform the action locally and publish results back into Elasticsearch.
5. **Reasoning loop.** The agent reads the results, decides whether the job is done, and either continues or reports back.

The important shift is that the agent is no longer trapped in the chatbox. It can see, plan, act, observe the result, and keep going.

## From outage to observability

The demo that made the idea click for people was not abstract at all.

A user shows up with a Kubernetes blind spot causing an expensive outage. A normal agent would explain how to instrument the environment. Augmented Infrastructure could do the real work:

1. Identify the cluster.
2. Create the namespaces.
3. Generate the secrets.
4. Install the OpenTelemetry operator.
5. Bring the user back with a live APM destination instead of a tutorial.

That is the difference between an agent that advises and an agent that participates.

## The security handoff matters just as much

The second scenario mattered to me because it exposed the same pattern from the security side.

If an agent is already looking at your environment, it should be able to do more than narrate risk. It should be able to enumerate assets, identify public exposure, recognize missing protection, and then help close the gap.

In the demo, the system inspected AWS resources, identified exposed infrastructure, and then deployed the right Elastic security controls with approval in the loop.

That is not a chatbot answering a security question. That is an operational partner participating in remediation.

## Why I care about this pattern

I spend a lot of time thinking about the boundary between tools and agents, because that boundary decides whether an agent feels magical for a minute or useful for a year.

Augmented Infrastructure is interesting precisely because it crosses that boundary cleanly. It gives the model a disciplined way to act in the outside world without pretending the outside world is just another paragraph of context.

That is the real move.

The future is not better chat. The future is systems that can reason, discover capability, execute through constrained tools, read back the result, and continue.

## Beyond infrastructure

Infrastructure happened to be the most visceral demo, but the pattern is broader than that.

Once you have runners, capability discovery, workflow orchestration, and a closed feedback loop, you can point the same architecture at other domains:

1. Augmented operations.
2. Augmented development.
3. Augmented synthetics.
4. Security response.
5. Environment repair.

The common theme is not the environment. It is the loop: discover, decide, act, observe, continue.

That is what makes the system feel like more than a chat experience.

## The part I still like best

The best sentence from the original post is still the simplest one:

**This is not talk. We're doing it.**

That is the bar I care about. If a system can only explain the work, it is interesting. If it can participate in the work safely and coherently, it becomes a different category of tool.

That is what Augmented Infrastructure was trying to prove.