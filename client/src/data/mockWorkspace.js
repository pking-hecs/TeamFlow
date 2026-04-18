const DEFAULT_TEAM_NAMES = ['Product Design', 'Backend Core', 'Growth Labs'];

function formatDateLabel(input) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(input));
}

function teamLabel(team, index) {
  return team?.name || DEFAULT_TEAM_NAMES[index % DEFAULT_TEAM_NAMES.length];
}

export function selectPrimaryTeamId(teams) {
  return teams?.[0]?.id || 1;
}

export function buildWorkspaceData(teams = []) {
  const sourceTeams = teams.length
    ? teams
    : DEFAULT_TEAM_NAMES.map((name, index) => ({
        id: index + 1,
        name,
        member_count: 4 + index,
        description: `${name} workspace`,
      }));

  const projects = sourceTeams.flatMap((team, index) => {
    const teamName = teamLabel(team, index);
    return [
      {
        id: team.id * 100 + 1,
        teamId: team.id,
        name: `${teamName} Platform Refresh`,
        description: 'Revamp the core collaboration experience, design language, and performance baseline.',
        deadline: `2026-05-${String(12 + index).padStart(2, '0')}`,
        owner: 'Amanda Ross',
        progress: 72 - index * 8,
      },
      {
        id: team.id * 100 + 2,
        teamId: team.id,
        name: `${teamName} Sprint Planning`,
        description: 'Coordinate milestone planning, backlog cleanup, and release notes.',
        deadline: `2026-06-${String(4 + index).padStart(2, '0')}`,
        owner: 'Jordan Lee',
        progress: 46 + index * 6,
      },
    ];
  });

  const tasks = projects.flatMap((project, index) => ([
    {
      id: project.id * 10 + 1,
      projectId: project.id,
      teamId: project.teamId,
      title: `Define scope for ${project.name}`,
      description: 'Write the delivery scope, dependencies, and acceptance criteria for the team to align on execution.',
      priority: index % 2 === 0 ? 'High' : 'Medium',
      status: 'To Do',
      assignee: 'Amanda Ross',
      deadline: project.deadline,
      comments: [
        { id: `${project.id}-c1`, author: 'Jordan Lee', text: 'Scope draft looks solid, just add API notes.', time: '2h ago' },
        { id: `${project.id}-c2`, author: 'Priya Shah', text: 'I can review the final acceptance criteria today.', time: '45m ago' },
      ],
    },
    {
      id: project.id * 10 + 2,
      projectId: project.id,
      teamId: project.teamId,
      title: `Build workflow cards for ${project.name}`,
      description: 'Implement the card grid, detail metadata, and responsive behavior for the list surface.',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'Jordan Lee',
      deadline: project.deadline,
      comments: [
        { id: `${project.id}-c3`, author: 'Amanda Ross', text: 'Please match the warmer neutral palette from the mock.', time: '1h ago' },
      ],
    },
    {
      id: project.id * 10 + 3,
      projectId: project.id,
      teamId: project.teamId,
      title: `QA handoff for ${project.name}`,
      description: 'Prepare validation notes, edge cases, and release checklist for signoff.',
      priority: 'Low',
      status: 'Done',
      assignee: 'Priya Shah',
      deadline: project.deadline,
      comments: [],
    },
  ]));

  return { projects, tasks };
}

export function getWorkspaceStats(teams = [], workspace) {
  const pendingTasks = workspace.tasks.filter((task) => task.status !== 'Done').length;
  const inProgressProjects = workspace.projects.filter((project) => project.progress < 100).length;
  const memberCount = teams.reduce((sum, team) => sum + (team.member_count || 0), 0);

  return {
    teamCount: teams.length,
    pendingTasks,
    inProgressProjects,
    memberCount,
  };
}

export function getProfileSummary(teams = [], workspace) {
  return {
    name: 'Amanda Ross',
    title: 'Product Operations Lead',
    email: 'amanda@berun.app',
    timezone: 'Asia/Kolkata',
    primaryTeam: teamLabel(teams[0], 0),
    focusHours: `${12 + workspace.projects.length}`,
    preferences: ['Weekly review', 'Design critique', 'Async standup', 'Priority alerts'],
  };
}

export function getTeamMembers(team) {
  const memberCount = team?.member_count || 4;
  return Array.from({ length: memberCount }, (_, index) => ({
    id: `${team?.id || 1}-${index + 1}`,
    name: ['Amanda Ross', 'Jordan Lee', 'Priya Shah', 'Ben Carter', 'Ava Patel', 'Ravi Kumar'][index % 6],
    role: index === 0 ? 'Admin' : index === 1 ? 'Lead' : 'Member',
    joinedAt: formatDateLabel(`2026-0${(index % 4) + 1}-${String(10 + index).padStart(2, '0')}`),
    email: `member${index + 1}@berun.app`,
  }));
}

export function getTeamProjects(workspace, teamId) {
  return workspace.projects.filter((project) => String(project.teamId) === String(teamId));
}

export function getProject(workspace, projectId) {
  return workspace.projects.find((project) => String(project.id) === String(projectId));
}

export function getProjectTasks(workspace, projectId) {
  return workspace.tasks.filter((task) => String(task.projectId) === String(projectId));
}

export function getTask(workspace, taskId) {
  return workspace.tasks.find((task) => String(task.id) === String(taskId));
}

export function getFilteredTasks(workspace, filters = {}) {
  return workspace.tasks.filter((task) => {
    if (filters.status && filters.status !== 'All' && task.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'All' && task.priority !== filters.priority) return false;
    if (filters.assignee && filters.assignee !== 'All' && task.assignee !== filters.assignee) return false;
    return true;
  });
}

export function formatShortDate(input) {
  return formatDateLabel(input);
}
