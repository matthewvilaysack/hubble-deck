export const meta = {
  name: 'hubble-dashboard',
  description: 'Gather tickets, PRs, repo state, and Slack signals for the Hubble dashboard',
  whenToUse: 'Run at session start (or on demand) to refresh the data behind the Hubble dashboard artifact',
  phases: [
    { title: 'Gather', detail: 'One read-only agent per enabled source, in parallel' },
  ],
}

// Edit this block before your first run. Each source is one read-only agent;
// disable any you do not use, and see the SOURCES registry below to add your own.
const CONFIG = {
  projectKey: 'PROJ',            // your Jira project key (the PROJ in PROJ-123)
  userName: 'Your Name',         // tickets assigned to this display name are marked "mine"
  repoHint: 'your-repo',         // a string that appears in your repo's remote URL or folder name
  slackChannels: ['#eng'],       // channels to scan for blockers, decisions, and open questions
  sources: {
    jira: true,
    repo: true,
    slack: false,                // needs a Slack MCP server or the Slack connector signed in
  },
}

const JIRA_SCHEMA = {
  type: 'object',
  required: ['tickets'],
  properties: {
    tickets: {
      type: 'array',
      items: {
        type: 'object',
        required: ['key', 'summary', 'status'],
        properties: {
          key: { type: 'string' },
          summary: { type: 'string' },
          status: { type: 'string' },
          type: { type: 'string' },
          priority: { type: 'string' },
          assignee: { type: 'string' },
          mine: { type: 'boolean' },
          updated: { type: 'string' },
        },
      },
    },
    notes: { type: 'string' },
  },
}

const REPO_SCHEMA = {
  type: 'object',
  required: ['repoPath'],
  properties: {
    repoPath: { type: 'string' },
    currentBranch: { type: 'string' },
    uncommittedFiles: { type: 'number' },
    prs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'title'],
        properties: {
          number: { type: 'number' },
          title: { type: 'string' },
          isDraft: { type: 'boolean' },
          headRef: { type: 'string' },
          reviewDecision: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
    },
    recentCommits: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

const SLACK_SCHEMA = {
  type: 'object',
  required: ['signals'],
  properties: {
    signals: {
      type: 'array',
      items: {
        type: 'object',
        required: ['kind', 'summary'],
        properties: {
          kind: { type: 'string', enum: ['blocker', 'decision', 'question', 'announcement'] },
          channel: { type: 'string' },
          summary: { type: 'string' },
          who: { type: 'string' },
          when: { type: 'string' },
          unanswered: { type: 'boolean' },
        },
      },
    },
    notes: { type: 'string' },
  },
}

// The source registry. To add a source (a build system, a pager, a wiki),
// add an entry here: an enabled flag in CONFIG.sources, a schema, and one
// read-only agent prompt that returns data matching it.
const SOURCES = {
  jira: () => agent(
    `Fetch open Jira tickets. Use ToolSearch to load mcp__atlassian__getAccessibleAtlassianResources and mcp__atlassian__searchJiraIssuesUsingJql, then run JQL: project = ${CONFIG.projectKey} AND statusCategory != Done ORDER BY updated DESC (max ~30 results). The user is ${CONFIG.userName} — mark tickets assigned to them with mine: true. Return key, summary, status, issue type, priority, assignee display name, and updated date for each. READ ONLY — never write to Jira. If the ${CONFIG.projectKey} project key fails, discover the right key via mcp__atlassian__getVisibleJiraProjects and retry. Put anything noteworthy (blocked tickets, high priority, auth failures) in notes.`,
    { label: 'jira:open-tickets', phase: 'Gather', schema: JIRA_SCHEMA },
  ),
  repo: () => agent(
    `Find the "${CONFIG.repoHint}" git repository on this machine (check ~/code, ~/Documents, ~/dev, the home directory — use ls/find, it is a git repo whose remote or folder name mentions "${CONFIG.repoHint}"). Once found, report: absolute repoPath, current branch, count of uncommitted files (git status --porcelain | wc -l), open GitHub PRs via "gh pr list --json number,title,isDraft,headRefName,reviewDecision,updatedAt --limit 15" run inside the repo (map headRefName to headRef), and the last 8 commit subjects on the default branch ("git log origin/main --oneline -8" or main). If gh fails or no repo is found, still return what you have and explain in notes. Read-only — do not modify the repo.`,
    { label: 'repo:prs-and-state', phase: 'Gather', schema: REPO_SCHEMA },
  ),
  slack: () => agent(
    `Scan the team's Slack for project-management signals. Use ToolSearch to discover available Slack tools (try "+slack" — an MCP server such as mcp__slack__* or the Slack connector). Read the last ~2 days of messages in these channels: ${CONFIG.slackChannels.join(', ')}. Extract only signals that matter for a project dashboard, classified by kind: "blocker" (someone is stuck or something is down), "decision" (a call was made that the team should know), "question" (asked and not yet answered — set unanswered: true), "announcement" (releases, deploys, schedule changes). For each: one-sentence summary in the speaker's own words where possible, channel, who, and roughly when. Skip chit-chat, bot noise, and anything resolved within its own thread. READ ONLY — never post, react, or mark anything read. If no Slack tools are available, return an empty signals list and say so in notes.`,
    { label: 'slack:signals', phase: 'Gather', schema: SLACK_SCHEMA },
  ),
}

phase('Gather')

const enabled = Object.keys(SOURCES).filter((name) => CONFIG.sources[name])
const results = await parallel(enabled.map((name) => SOURCES[name]))

const out = {}
enabled.forEach((name, i) => { out[name] = results[i] })
return out
