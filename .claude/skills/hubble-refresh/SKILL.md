---
name: hubble-refresh
description: Refresh the Hubble dashboard. Runs the hubble-dashboard workflow (read-only agents over Jira, the repo, and Slack), rebuilds hubble.html from the results, and republishes it. Use when the user invokes /hubble-refresh, says "refresh hubble", "update the dashboard", "rebuild the deck", or asks for the current state of the board.
---

# Refresh the Hubble dashboard

Turn fresh source data into an updated `hubble.html`. The page is the product; treat every rebuild like an edition of a small newspaper.

## Steps

1. Check `CONFIG` at the top of `.claude/workflows/hubble-dashboard.js`. If it still says `PROJ` / `Your Name` / `your-repo`, stop and ask the user to fill it in; refreshing demo config produces garbage.
2. Run the workflow: `Workflow` tool with `{name: "hubble-dashboard"}`. It returns one key per enabled source (`jira`, `repo`, `slack`), each with a `notes` field.
3. Rebuild the sections of `hubble.html` from the results, using the mapping below.
4. Republish: as a Claude Code artifact (reuse the existing artifact URL when the user has one), or just tell the user to reload if they serve it locally with `bun run dev`.

## Data-to-section mapping

| Data | Section |
|---|---|
| `jira.tickets` counts | stat tiles (open, yours, highest priority, flares) |
| tickets with `mine: true` | Your orbit cards, most recently updated first |
| tickets whose summary or priority says critical/urgent | Signal flares, quoted in their own words |
| `slack.signals` | Ground control, one row per signal, kind drives the flag class (`crit` for blockers, `question`, `decision`, `announce`) |
| all tracked tickets | the three charts: Pipeline (by status), Team load (by assignee, the user's bar keeps its accent ring), Priority mix |
| `repo` | The repository panels: working state, human vs dependabot PRs, recent commits |
| `jira.notes`, `repo.notes`, `slack.notes` | Field notes, merged with any standing notes the user wants kept |

## Consistency rules

- Numbers must reconcile: each chart's bars sum to the tracked-ticket count, and the tiles agree with the sections below them.
- Bar widths are proportional to the largest bar in that chart (largest = 100%).
- Update the dateline (date, sources actually used, "N most recently updated of M open") and the footer date.
- Never invent data. A source that was disabled or returned nothing keeps its section with a one-line note saying so; do not fill gaps with plausible content.
- Never write to Jira, GitHub, or Slack. The whole layer is read-only.
- Preserve the page's structure, CSS, and the `PALETTES` script untouched; only the content inside sections changes.
