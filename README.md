# Hubble

A quiet observation-deck dashboard for a software team: your assigned tickets, critical and urgent flares, the shape of the board, and repo state, all on one self-contained page. The look is a nod to [hubble.md](https://github.com/bholmesdev/hubble.md).

The page ships with fictional demo data (the ATLAS project and the atlas-app repo do not exist) so you can see every section populated. Point the workflow at your own Jira project and repo, and each refresh replaces the demo content with your real board.

## What's in here

- `hubble.html`: the dashboard page itself. Plain, self-contained HTML with no build step and no dependencies. Open it straight from disk, serve it statically, or publish it as a Claude Code artifact.
- `workflows/hubble-dashboard.js`: a Claude Code workflow that gathers the data behind the page. It runs two agents in parallel: one pulls the most recently updated open tickets from Jira (read only, it never writes), the other reads PR and branch state from your local checkout via `gh`.

## Sections

- **Stat tiles**: open tickets, yours, highest priority, signal flares, open PRs.
- **Your orbit**: the tickets assigned to you that deserve attention now.
- **Signal flares**: tickets flagged critical or urgent in their own words, including the ones whose priority field disagrees with their wording.
- **The shape of the board**: pipeline by stage, team load per assignee (your bar is ringed), and priority mix.
- **The repository**: current branch, uncommitted files, open PRs, recent commits on main.
- **Field notes**: standing context worth keeping in view, the tribal knowledge that never fits in a ticket.

## Refreshing the dashboard

1. Edit the `CONFIG` block at the top of `workflows/hubble-dashboard.js`: your Jira project key, your display name (that drives the "Your orbit" section and the highlighted bar in "Team load"), and a hint for finding your repo.
2. Copy the file into `~/.claude/workflows/` (one time).
3. In Claude Code, ask: "run the hubble-dashboard workflow, rebuild hubble.html with the results, and publish it as an artifact."
4. Claude updates the ticket cards, charts, and repo panels with the fresh data and republishes the page. Keep the same artifact URL by publishing from the same conversation, or pass your artifact URL when publishing from a new one.

You will need Claude Code with the Atlassian connector signed into your Jira site, `gh` authenticated, and a local clone of your repo. Nothing here writes to Jira or GitHub.

## Palettes

The header has a palette picker (Nebula is the default, plus Slate, Forest, and Plum) that recolors the categorical series and the pipeline ramp. The choice persists per browser, and each palette carries light and dark variants. Priority and status colors are fixed on purpose so urgency always reads the same regardless of palette. To add your own palette, add an entry to the `PALETTES` object near the bottom of `hubble.html` and a matching `<option>` to the picker in the header.

## License

MIT
