export const meta = {
  name: 'hubble-dashboard',
  description: 'Gather open Jira tickets, GitHub PRs, and repo state for the Hubble dashboard',
  whenToUse: 'Run at session start (or on demand) to refresh the data behind the Hubble dashboard artifact',
  phases: [
    { title: 'Gather', detail: 'Jira tickets + GitHub PRs + repo state in parallel' },
  ],
}

// Edit these three values before your first run.
const CONFIG = {
  projectKey: 'PROJ',            // your Jira project key (the PROJ in PROJ-123)
  userName: 'Your Name',         // tickets assigned to this display name are marked "mine"
  repoHint: 'your-repo',         // a string that appears in your repo's remote URL or folder name
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

phase('Gather')

const [jira, repo] = await parallel([
  () => agent(
    `Fetch open Jira tickets. Use ToolSearch to load mcp__atlassian__getAccessibleAtlassianResources and mcp__atlassian__searchJiraIssuesUsingJql, then run JQL: project = ${CONFIG.projectKey} AND statusCategory != Done ORDER BY updated DESC (max ~30 results). The user is ${CONFIG.userName} — mark tickets assigned to them with mine: true. Return key, summary, status, issue type, priority, assignee display name, and updated date for each. READ ONLY — never write to Jira. If the ${CONFIG.projectKey} project key fails, discover the right key via mcp__atlassian__getVisibleJiraProjects and retry. Put anything noteworthy (blocked tickets, high priority, auth failures) in notes.`,
    { label: 'jira:open-tickets', phase: 'Gather', schema: JIRA_SCHEMA },
  ),
  () => agent(
    `Find the "${CONFIG.repoHint}" git repository on this machine (check ~/code, ~/Documents, ~/dev, the home directory — use ls/find, it is a git repo whose remote or folder name mentions "${CONFIG.repoHint}"). Once found, report: absolute repoPath, current branch, count of uncommitted files (git status --porcelain | wc -l), open GitHub PRs via "gh pr list --json number,title,isDraft,headRefName,reviewDecision,updatedAt --limit 15" run inside the repo (map headRefName to headRef), and the last 8 commit subjects on the default branch ("git log origin/main --oneline -8" or main). If gh fails or no repo is found, still return what you have and explain in notes. Read-only — do not modify the repo.`,
    { label: 'repo:prs-and-state', phase: 'Gather', schema: REPO_SCHEMA },
  ),
])

return { jira, repo }
