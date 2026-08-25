# Hubble

A quiet observation-deck dashboard for a software team, and a thin observability layer over your project management: tickets, pull requests, repo state, and team-channel signals, all on one self-contained page. The look is a nod to [hubble.md](https://github.com/bholmesdev/hubble.md).

The page ships with fictional demo data (the ATLAS project, the atlas-app repo, and its team do not exist) so you can see every section populated. Point the sources at your own tools and each refresh replaces the demo content with your real board.

## The two-minute demo

```sh
git clone https://github.com/matthewvilaysack/hubble-deck && cd hubble-deck
bun run dev        # serves the page; open it and flip the palette picker
claude             # start Claude Code inside the repo
```

Inside Claude Code the skills and the workflow load from `.claude/` automatically:

1. `/hubble-refresh` fans out one read-only agent per source (Jira, your repo, Slack), rebuilds the page from what they found, and republishes it. On a fresh clone it stops and asks you to fill in `CONFIG` first, which is the 30-second setup.
2. `/hubble-standup` turns your slice of the board into the three sentences you say at standup.
3. `/hubble-weekly` drafts the Friday team update: shipped, board shape, flags, next.

Nothing writes to Jira, GitHub, or Slack at any point. The page is static output with no backend, no polling, and no credentials of its own.

## How it's shaped

- `hubble.html`: the dashboard page itself. Plain, self-contained HTML with no build step and no dependencies. Open it straight from disk, serve it with `bun run dev`, or publish it as a Claude Code artifact.
- `.claude/workflows/hubble-dashboard.js`: the data layer. Each source is one read-only agent; the enabled ones run in parallel and return structured results.
- `.claude/skills/`: the three skills above, picked up automatically when Claude Code runs inside the repo. Copy them to `~/.claude/skills/` if you want them available everywhere.

The layer stays thin on purpose. The workflow only collects and summarizes, the skills only read and draft, and the human stays on send for anything that leaves the machine.

## Sources

Toggle each one in the `CONFIG.sources` block at the top of the workflow.

| Source | What it pulls | Needs |
|---|---|---|
| `jira` | the most recently updated open tickets: status, priority, assignee, which ones are yours | Claude Code's Atlassian connector signed into your site |
| `repo` | current branch, uncommitted files, open PRs, recent commits on main | `gh` authenticated and a local clone |
| `slack` | blockers, decisions, unanswered questions, and announcements from the channels you list | a Slack MCP server or the Slack connector (off by default) |

The Slack agent classifies what it reads instead of mirroring it: a message only surfaces as a blocker, decision, question, or announcement, one sentence each, and resolved threads are skipped. That feeds the Ground control section of the page.

To add your own source (a build system, a pager, a wiki), add an entry to the `SOURCES` registry in the workflow: an enabled flag, a schema, and one read-only agent prompt. The dashboard section it feeds is yours to design.

## Sections

- **Stat tiles**: open tickets, yours, highest priority, signal flares, open PRs.
- **Your orbit**: the tickets assigned to you that deserve attention now.
- **Signal flares**: tickets flagged critical or urgent in their own words, including the ones whose priority field disagrees with their wording.
- **Ground control**: what the team channels are saying: blockers, decisions, open questions, announcements.
- **The shape of the board**: pipeline by stage, team load per assignee (your bar is ringed), and priority mix.
- **The repository**: current branch, uncommitted files, open PRs, recent commits on main.
- **Field notes**: standing context worth keeping in view, the tribal knowledge that never fits in a ticket.

## Palettes

The header has a palette picker (Nebula is the default, plus Slate, Forest, and Plum) that recolors the categorical series and the pipeline ramp. The choice persists per browser, and each palette carries light and dark variants. Priority and status colors are fixed on purpose so urgency always reads the same regardless of palette. To add your own palette, add an entry to the `PALETTES` object near the bottom of `hubble.html` and a matching `<option>` to the picker in the header.

## Tooling conventions

JavaScript tooling runs on [bun](https://bun.sh) (`bun run dev` serves the page locally; there is nothing to install). If a Python helper ever joins the repo, it runs with [uv](https://docs.astral.sh/uv/) (`uv run script.py`) rather than a managed virtualenv. No npm, no pip.

## License

MIT
