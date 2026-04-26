---
title: "Why We Shipped Performance Presets Instead of Better Documentation"
description: "Elastic Agent had accumulated a pile of tuning knobs that only experts could use well. Performance Presets were a product decision to package judgment, not just publish more YAML advice."
pubDate: 2024-01-29
tags: ["Product", "Observability", "Elastic Agent", "Performance"]
draft: false
---

The interesting product decision behind Elastic Agent Performance Presets was not really about adding four buttons to the UI.

It was about admitting that a lot of "configurability" is just expertise debt with a settings panel wrapped around it.

For years, Elastic Agent and Beats had a cluster of performance-related values you could tune if you knew what you were doing: batch sizes, worker counts, queue behavior, flush thresholds, timeouts, and the rest of the little knobs that decide whether data moves smoothly or expensively.

The standard product answer to that situation is usually: write better documentation.

I did not think that was enough.

## The real problem was not lack of information

When users struggle with advanced configuration, it is tempting to say the product has a docs problem.

Sometimes that is true. Sometimes the UI is fine, the model is fine, and the user just needs clearer instructions.

This was not one of those cases.

The problem was that tuning Elastic Agent well required a level of systems intuition most users should not need in order to get good results. You had to understand the interaction between throughput, memory pressure, connection counts, batching behavior, latency, and Elasticsearch-side consequences. You also had to know which trade-off you were actually trying to make.

That is not a documentation gap. That is a product-design gap.

If the right outcome depends on users mastering an internal tuning model that we already understand better than they do, the job is not to explain the knobs more patiently. The job is to package the judgment.

## Documentation would have preserved the burden

Imagine the alternative path.

We could have written a beautifully detailed guide explaining what each setting does:

1. `bulk_max_size`
2. `workers`
3. `queue.mem.events`
4. `queue.mem.flush.min_events`
5. `queue.mem.flush.timeout`
6. `compression_level`
7. `connection_idle_timeout`

We could have added decision trees, examples, and benchmark charts. We could have published recipes for "high throughput," "many small agents," "low-latency ingestion," and "large fan-out behind a load balancer."

That still would have left users doing systems tuning by hand.

Worse, it would have made the product look friendlier while keeping the underlying burden exactly where it was: on the user.

That is usually a smell.

Better documentation is absolutely worth doing when users need to understand the system. It is a bad substitute when users mostly need the system to make a good decision on their behalf.

## The product question was: where should the expertise live?

By the time we shipped Performance Presets in 8.12, we already had enough information to know a few things.

We had field experience. We had performance testing. We had repeated patterns from customers. We knew that most users were not trying to discover some novel point in a giant tuning space. They were trying to make one of a small number of recognizable trade-offs:

1. Give me the sane default.
2. Max out throughput.
3. Let me scale to a very large number of agents without turning connection overhead into a problem.
4. Keep latency low.

Once you say the problem that way, the design starts to clarify.

The user does not actually want seven low-level controls. The user wants to express intent.

So the product should ask for intent.

## Presets are compressed expertise

That is what the presets were for.

Instead of forcing users to manually discover and combine the right settings, we exposed a smaller decision surface:

1. **Balanced**
2. **Optimized for Throughput**
3. **Optimized for Scale**
4. **Optimized for Latency**
5. **Custom** as the escape hatch

That looks simpler on the surface because it is simpler on the surface. But the more important point is that it is also more honest.

The actual product value was not "you may now choose from four names instead of editing YAML." The value was that we were finally taking responsibility for the fact that these settings are coupled and that most users should not have to rediscover those couplings themselves.

Balanced becoming the default was part of the same decision. The old defaults had been around for a long time and were anchored in an older view of what the system should optimize first. 8.12 changed that posture and moved the default toward a better overall operating point.

## This is what productization looks like

I think there is a general product lesson here.

Teams often treat "advanced settings" as evidence of power. Sometimes they are. Just as often they are evidence that the product has not yet absorbed enough of the domain knowledge sitting inside the company.

When you ship presets, templates, opinionated defaults, or guided paths, you are not necessarily dumbing the product down. You are often doing the opposite. You are taking the expertise that previously lived in Slack threads, solutions architects, benchmark notebooks, and tribal memory, and moving it into the product where it belongs.

That was the real move with Performance Presets.

## The numbers mattered, but the interface decision mattered more

The 8.12 work came with real performance improvements. The launch post called out improvements such as higher throughput, lower memory usage, fewer concurrent connections to Elasticsearch, and less disk I/O pressure from Beats and Agent requests. The preset definitions also made the trade-offs legible:

1. **Balanced** as the new default and broadest fit.
2. **Throughput** for much higher ingestion volume.
3. **Scale** for very large deployments where connection count matters a lot.
4. **Latency** for lower-delay delivery and as the closest match to the older default behavior.

Those numbers help users trust the presets.

But if all we had done was benchmark the old knobs better and publish a table, we would have missed the point. The meaningful product change was deciding that performance tuning should start from workload intent instead of parameter literacy.

## Custom still had to exist

This part matters because "ship presets" can turn into dogma if you are not careful.

There are always users operating at weird edges. There are always environments with unusual constraints. There are always people who really do need full control and know exactly why.

That is why **Custom** mattered.

The goal was never to remove expertise from the system. The goal was to stop making expert behavior the default requirement for ordinary success.

Good product design does not eliminate the escape hatch. It just stops pretending the escape hatch is the front door.

## The broader lesson

I keep coming back to the same framing when I think about product work:

When users repeatedly need documentation to navigate a complex decision, ask whether the real problem is missing explanation or missing product judgment.

Sometimes the answer is documentation.

Sometimes the answer is that you already know enough to make the product choose better defaults, expose the real trade-offs directly, and let users talk in terms of goals instead of internals.

Performance Presets came from the second bucket.

It was not a decision to explain the knobs better.

It was a decision to stop making so many users care about the knobs at all.

If you want the release-shaped version of this story, the original 8.12 announcement is here: [Using Elastic Agent Performance Presets in 8.12](https://www.elastic.co/blog/using-elastic-agent-performance-presets-in-8-12).