---
title: "Pull Requests Are Dead. Long Live Context."
description: "AI made code generation cheap without making review cheap. For open source, that shifts the scarce resource from code to context."
pubDate: 2026-03-12
tags: ["Open Source", "AI", "Context Engineering"]
draft: false
---

_Originally published on [Substack](https://strawgate.substack.com/p/pull-requests-are-dead-long-live)._ This version is edited for the site.

I think AI killed the drive-by pull request.

Not collaboration. Not maintainer teams. Not trusted contributors who already share context, review norms, and a reason to care whether the code is readable six months from now.

I mean the classic open-source workflow where a stranger arrives with a patch, drops it in your queue, and expects the main cost to be the code they already wrote.

That model was shaky before AI. AI just made the math impossible to ignore.

## The scarce resource was never code

Even before copilots, there was a structural asymmetry in open source:

1. Writing a pull request was relatively cheap.
2. Reviewing a pull request was relatively expensive.
3. The maintainer was the one paying the expensive side every time.

The scarce resource was never lines of code. It was judgment, attention, and sustained care.

That asymmetry is now brutal. LLMs can produce a respectable-looking patch in seconds. Review still takes human time. Security still takes human time. Regression analysis still takes human time. The part we accelerated is not the part that was bottlenecking the system.

So the queue fills with artifacts that are cheaper than ever to produce and exactly as expensive as ever to evaluate.

That is not a scaling story. That is a denial-of-service story.

## AI inverted the backpressure

Once code generation approached zero cost, the old backpressure disappeared.

The maintainer cannot rely on the cost of producing code to filter out weak contributions anymore. A ten-thousand-line patch can now be produced by someone with almost no investment in the system they are changing. The patch may even be plausible. That does not make it reviewable.

This is why so many maintainers sound exhausted when they talk about AI-era contribution flows. The problem is not that the code is always bad. The problem is that the system can no longer assume the person creating the diff paid a meaningful cost to create it.

Once that happens, the review queue stops being a collaboration surface and starts being an adversarial input channel.

## Every stranger PR is an attack surface

Security people tend to sound dramatic about this because we learned the lesson in other places first: untrusted input is not just work, it is exposure.

A large pull request from a stranger is not only something to review for quality. It is something to review for intent, provenance, hidden regressions, dependency changes, prompt-shaped weirdness, and all the little choices that make sense only if you already know the system well.

AI makes that worse in two ways:

1. It can produce much larger patches than a casual contributor would have written by hand.
2. It obscures where the reasoning came from, because you usually do not get the prompt, the iterations, or the actual decision path that led to the diff.

So now the maintainer is being asked to accept high-volume code from low-trust sources, with reduced visibility into how it was made, and with the same accountability if something goes wrong after merge.

That is not a healthy default workflow.

## We should learn from projects that never optimized for drive-by patches

SQLite figured this out long ago.

It is one of the most deployed pieces of software on earth, and it never built its success around accepting arbitrary pull requests from the internet. That is not because the maintainers hate contributors. It is because consistency, trust, and deep ownership beat queue volume.

When a project is important enough, code quality is not just about whether the patch passes tests. It is about whether the people who own the system understand it well enough to keep evolving it without entropy.

That model looks less weird every month.

## The maintainer can push the button now

This is the part that changes the contribution model most directly.

If I am a maintainer and you file an issue with great context, I can now often do the implementation myself with the help of an agent faster than I can safely review a stranger's patch.

That matters.

The valuable contribution is no longer necessarily the code artifact. The valuable contribution is:

1. A precise bug report.
2. A clear feature request.
3. Reproduction details.
4. Constraints.
5. Expected behavior.
6. Domain knowledge the maintainer does not already have.

That is the part the machine still cannot hallucinate into existence.

The code is increasingly the cheap part. The context is the expensive part.

## The new workflow is issue-first

So here is the hot take in its simplest form:

The future of open-source contribution is not primarily pull requests. It is issues, design notes, reproduction cases, benchmarks, architectural objections, and crisp descriptions of what actually matters.

Contributors should spend more time telling maintainers what is wrong and less time feeling obligated to preemptively write the patch.

Maintainers should feel more comfortable saying:

"Don't worry about the code. Give me the context. I'll push the button."

That does not diminish contributors. It makes the division of labor more honest.

## The caveat matters

This does not mean pull requests disappear.

Inside trusted teams, PRs are still a great synchronization mechanism. Among long-term contributors with shared norms, they remain efficient. In enterprises, they are still often the right unit of review. Within a maintainer group, code review is collaboration, not cold-start evaluation.

The thing that is dying is the drive-by PR from someone with no established trust and very little shared context.

That workflow was already under strain. AI just finished the job.

## What I want from contributors now

If you want to contribute to a project I maintain, the best possible thing you can give me is one of these:

1. A bug report with a minimal reproduction.
2. A feature request tied to a real workflow.
3. A design comment that spots the hidden trade-off.
4. Benchmarks.
5. Docs fixes that improve understanding instead of rearranging words.
6. Domain context I do not already have.

That is the work that compounds.

Code still matters. But in the AI era, code is no longer the thing in shortest supply.

Context is.