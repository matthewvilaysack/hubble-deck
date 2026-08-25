---
name: hubble-standup
description: Draft a personal standup update from the current Hubble dashboard data. Use when the user invokes /hubble-standup, says "write my standup", "what do I say at standup", or "standup from the deck".
---

# Standup from the deck

Turn the current dashboard state into the three sentences the user actually says at standup.

## Steps

1. Get current data. If `hubble.html` was refreshed today, read it; otherwise run the `hubble-dashboard` workflow first (see the hubble-refresh skill).
2. Draft three short parts from the user's slice of the data:
   - **Done / in review**: their tickets that moved to Code Review, Testing, or closed, plus any merged PRs of theirs.
   - **Today**: their most recently active ticket or branch, stated as an intention.
   - **Blocked / flagged**: anything of theirs that is blocked, plus any Ground control blocker or unanswered question that touches their work.
3. Write it as flowing prose in the user's voice: plain sentences, no bullet headers, no ticket-system jargon beyond the ticket keys themselves. Two to four sentences total is the target.
4. Show the draft in the conversation. Never post it anywhere; the user pastes it themselves.

## Rules

- Only claim what the data shows. If nothing of the user's moved, say the honest version ("still on ATLAS-142, review pending") rather than inventing motion.
- Ticket keys stay in (`ATLAS-142`), links stay out; standup messages do not need URLs.
- If the deck is stale (dateline older than yesterday), say so and offer to refresh first.
