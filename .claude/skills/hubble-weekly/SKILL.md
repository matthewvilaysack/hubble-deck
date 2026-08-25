---
name: hubble-weekly
description: Compose a weekly team update from the Hubble dashboard, covering what shipped, how the board moved, and what is flagged. Use when the user invokes /hubble-weekly, says "write the weekly update", "team update from the deck", or "summarize the week for the team".
---

# Weekly update from the deck

Produce the short update a lead posts on Friday: what shipped, where the board stands, what needs eyes.

## Steps

1. Get current data: refresh via the `hubble-dashboard` workflow (see the hubble-refresh skill) so the update reflects today, not the last rebuild.
2. Structure the update in four short parts, prose over bullets wherever a sentence carries it:
   - **Shipped**: merged human PRs and commits that landed on main this week, grouped by theme rather than listed one per line.
   - **The board**: one or two sentences on shape: how many open, where the pile sits in the pipeline, who is loaded.
   - **Flagged**: signal flares still open, plus decisions and unresolved blockers from Ground control.
   - **Next**: what the top-priority open items imply for next week.
3. Keep it under ~150 words. A weekly update that nobody reads is worse than none.
4. Deliver as markdown in the conversation for the user to paste into Slack, email, or a doc. Never post it anywhere yourself.

## Rules

- Facts only from the gathered data; no projections beyond what priorities imply.
- Name people only in the positive or neutral ("Riley carries the biggest slice"), never as blame.
- If a week had little movement, say that plainly; do not pad.
