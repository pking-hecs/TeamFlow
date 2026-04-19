import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { projectsApi, tasksApi, teamsApi } from '../services/api.js';
import { formatShortDate } from '../data/mockWorkspace.js';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

function formatDeadline(input) {
  if (!input) return 'No deadline';
  return formatShortDate(input);
}

function getTeamName(teams, teamId) {
  return teams.find((team) => String(team.id) === String(teamId))?.name || 'Unknown team';
}

function getTeamRole(teams, teamId) {
  return teams.find((team) => String(team.id) === String(teamId))?.role || 'member';
}

function getMemberDisplayName(member, authUser) {
  if (!member) return '';
  return String(member.id) === String(authUser?.id) ? `${member.name} (You)` : member.name;
}

function ProjectsListPage({ teams }) {
  const [selectedTeam, setSelectedTeam] = useState(String(teams[0]?.id || ''));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = getTeamRole(teams, selectedTeam) === 'admin';

  useEffect(() => {
    if (!selectedTeam) {
      setProjects([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    projectsApi.getAll(selectedTeam)
      .then((res) => {
        if (active) setProjects(res.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load projects');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Project management</span>
          <h2>Projects</h2>
        </div>
        <div className="header-actions">
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          {isAdmin ? <Link to="/projects/new" className="primary-button">Create project</Link> : null}
        </div>
      </div>

      {!isAdmin && selectedTeam ? (
        <article className="glass-card">
          <p>Only team admins can create projects for this team.</p>
        </article>
      ) : null}

      {error ? <article className="glass-card"><p>{error}</p></article> : null}
      {loading ? <article className="glass-card"><p>Loading projects...</p></article> : null}

      {!loading && !projects.length ? (
        <article className="glass-card">
          <p>No projects yet for this team.</p>
        </article>
      ) : null}

      <div className="project-list">
        {projects.map((project) => (
          <article key={project.id} className="glass-card project-row">
            <div>
              <h3>{project.name}</h3>
              <p>{project.description || 'This project is currently title-only in the database schema.'}</p>
            </div>
            <div className="project-row-meta">
              <span>{getTeamName(teams, project.team_id)}</span>
              <span>{formatDeadline(project.deadline)}</span>
              <Link className="secondary-button" to={`/projects/${project.id}`}>Open</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCreationForm({ teams }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    team_id: String(teams[0]?.id || ''),
    name: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = getTeamRole(teams, form.team_id) === 'admin';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.team_id || !form.name.trim() || !isAdmin) return;

    setSaving(true);
    setError('');

    try {
      const res = await projectsApi.create({
        team_id: form.team_id,
        name: form.name.trim(),
      });
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-stack">
      <article className="glass-card form-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Project creation</span>
            <h2>Create a project</h2>
          </div>
          <Link className="secondary-button" to="/projects">Back to projects</Link>
        </div>

        {error ? <p>{error}</p> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Team
            <select value={form.team_id} onChange={(e) => setForm((state) => ({ ...state, team_id: e.target.value }))}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>
          <label>
            Project name
            <input value={form.name} onChange={(e) => setForm((state) => ({ ...state, name: e.target.value }))} placeholder="Website relaunch" />
          </label>
          {!isAdmin ? <p>Only admins can create projects for this team.</p> : null}
          <button type="submit" className="primary-button" disabled={saving || !isAdmin}>
            {saving ? 'Saving...' : 'Save project'}
          </button>
        </form>
      </article>
    </section>
  );
}

function ProjectDetailPage({ teams }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [name, setName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = getTeamRole(teams, project?.team_id) === 'admin';

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [projectRes, tasksRes] = await Promise.all([
          projectsApi.getById(projectId),
          tasksApi.getAll({ projectId }),
        ]);

        if (!active) return;
        setProject(projectRes.data);
        setName(projectRes.data.name || '');
        setTasks(tasksRes.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!project?.team_id) return;
    let active = true;

    teamsApi.getById(project.team_id)
      .then((res) => {
        if (active) setTeamMembers(res.data.data.members || []);
      })
      .catch(() => {
        if (active) setTeamMembers([]);
      });

    return () => {
      active = false;
    };
  }, [project?.team_id]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await projectsApi.update(projectId, { name: name.trim() });
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectsApi.delete(projectId);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (!isAdmin) return;

    try {
      const res = await tasksApi.create({
        project_id: projectId,
        title: newTaskTitle.trim(),
        status: 'To Do',
        assignee_id: newTaskAssigneeId || undefined,
      });
      setTasks((current) => [...current, res.data]);
      setNewTaskTitle('');
      setNewTaskAssigneeId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (loading) {
    return <section className="page-stack"><article className="glass-card"><p>Loading project...</p></article></section>;
  }

  if (!project) {
    return <section className="page-stack"><article className="glass-card"><p>{error || 'Project not found'}</p></article></section>;
  }

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Project detail</span>
          <h2>{project.name}</h2>
          <p className="subtle-copy">{getTeamName(teams, project.team_id)}</p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button" to="/projects">Back to projects</Link>
          {isAdmin ? <button className="ghost-block danger" onClick={handleDelete}>Delete project</button> : null}
        </div>
      </div>

      {error ? <article className="glass-card"><p>{error}</p></article> : null}

      {isAdmin ? (
        <div className="content-grid two-up">
          <article className="glass-card form-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Edit project</span>
                <h3>Project info</h3>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleSave}>
              <label>
                Project name
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </article>

          <article className="glass-card form-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Quick add</span>
                <h3>Create and assign a task</h3>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleCreateTask}>
              <label>
                Task title
                <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Write user story" />
              </label>
              <label>
                Assign to
                <select value={newTaskAssigneeId} onChange={(e) => setNewTaskAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => <option key={member.id} value={member.id}>{getMemberDisplayName(member, authUser)}</option>)}
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={() => setNewTaskAssigneeId(authUser?.id || '')}>
                Assign to me
              </button>
              <button type="submit" className="primary-button">Add task</button>
            </form>
          </article>
        </div>
      ) : (
        <article className="glass-card">
          <p>Only team admins can create projects and assign tasks. Members can still view project progress here.</p>
        </article>
      )}

      <article className="glass-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Tasks</span>
            <h3>Associated tasks</h3>
          </div>
        </div>
        <div className="project-list associated-task-list">
          {tasks.length ? tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-row associated-task-row">
              <div className="associated-task-copy">
                <strong>{task.title}</strong>
                <span>{task.status || 'No status'}{task.assignee_name ? ` · ${task.assignee_name}` : ''}{task.deadline ? ` · ${formatDeadline(task.deadline)}` : ''}</span>
              </div>
            </Link>
          )) : <p>No tasks yet for this project.</p>}
        </div>
      </article>
    </section>
  );
}

function TasksListPage({ teams }) {
  const authUser = useSelector((state) => state.auth.user);
  const [selectedTeam, setSelectedTeam] = useState(String(teams[0]?.id || ''));
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState({ title: '', description: '', status: 'To Do', deadline: '', assignee_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = getTeamRole(teams, selectedTeam) === 'admin';

  useEffect(() => {
    if (!selectedTeam) return;
    let active = true;

    projectsApi.getAll(selectedTeam)
      .then((res) => {
        if (!active) return;
        setProjects(res.data);
        setSelectedProject(String(res.data[0]?.id || ''));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load projects');
      });

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) return;
    let active = true;

    teamsApi.getById(selectedTeam)
      .then((res) => {
        if (active) setTeamMembers(res.data.data.members || []);
      })
      .catch(() => {
        if (active) setTeamMembers([]);
      });

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    tasksApi.getAll({ projectId: selectedProject })
      .then((res) => {
        if (active) setTasks(res.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load tasks');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedProject]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => statusFilter === 'All' || task.status === statusFilter),
    [statusFilter, tasks]
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!selectedProject || !form.title.trim() || !isAdmin) return;

    try {
      const res = await tasksApi.create({
        project_id: selectedProject,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        deadline: form.deadline || undefined,
        assignee_id: form.assignee_id || undefined,
      });
      setTasks((current) => [...current, res.data]);
      setForm({ title: '', description: '', status: 'To Do', deadline: '', assignee_id: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Task management</span>
          <h2>Tasks</h2>
        </div>
        <Link to="/kanban" className="secondary-button">Open Kanban</Link>
      </div>

      <article className="glass-card">
        <div className="filter-row">
          <label>
            Team
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>
          <label>
            Project
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', ...TASK_STATUSES].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>

        {!isAdmin ? <p>Only team admins can assign or create tasks for this team.</p> : null}

        {error ? <p>{error}</p> : null}
        {loading ? <p>Loading tasks...</p> : null}

        <div className="project-list task-grid">
          {filteredTasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-row">
              <div>
                <strong>{task.title}</strong>
                <span>{task.description || 'No description'}</span>
              </div>
              <div className="task-tags">
                <span className="soft-pill">{task.status || 'No status'}</span>
                <span>{task.assignee_name || 'Unassigned'}</span>
                <span>{task.deadline ? formatDeadline(task.deadline) : 'No deadline'}</span>
              </div>
            </Link>
          ))}
          {!loading && !filteredTasks.length ? <p>No tasks found.</p> : null}
        </div>
      </article>

      {isAdmin ? (
        <article className="glass-card form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Task creation</span>
              <h3>Create and assign a task</h3>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleCreate}>
            <label>
              Task title
              <input value={form.title} onChange={(e) => setForm((state) => ({ ...state, title: e.target.value }))} placeholder="Write user story" />
            </label>
            <label>
              Description
              <textarea rows="3" value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} placeholder="Add task details" />
            </label>
            <label>
              Assign to
              <select value={form.assignee_id} onChange={(e) => setForm((state) => ({ ...state, assignee_id: e.target.value }))}>
                <option value="">Unassigned</option>
                {teamMembers.map((member) => <option key={member.id} value={member.id}>{getMemberDisplayName(member, authUser)}</option>)}
              </select>
            </label>
            <button type="button" className="secondary-button" onClick={() => setForm((state) => ({ ...state, assignee_id: authUser?.id || '' }))}>
              Assign to me
            </button>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm((state) => ({ ...state, status: e.target.value }))}>
                {TASK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label>
              Deadline
              <input type="date" value={form.deadline} onChange={(e) => setForm((state) => ({ ...state, deadline: e.target.value }))} />
            </label>
            <button type="submit" className="primary-button" disabled={!selectedProject}>Save task</button>
          </form>
        </article>
      ) : null}
    </section>
  );
}

function TaskDetailPage({ teams }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [task, setTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'To Do', deadline: '', assignee_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = getTeamRole(teams, task?.team_id) === 'admin';

  useEffect(() => {
    let active = true;

    tasksApi.getById(taskId)
      .then((res) => {
        if (!active) return;
        setTask(res.data);
        setForm({
          title: res.data.title || '',
          description: res.data.description || '',
          status: res.data.status || 'To Do',
          deadline: res.data.deadline || '',
          assignee_id: res.data.assignee_id || '',
        });
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load task');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [taskId]);

  useEffect(() => {
    if (!task?.team_id) return;
    let active = true;

    teamsApi.getById(task.team_id)
      .then((res) => {
        if (active) setTeamMembers(res.data.data.members || []);
      })
      .catch(() => {
        if (active) setTeamMembers([]);
      });

    return () => {
      active = false;
    };
  }, [task?.team_id]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!isAdmin) return;
      const res = await tasksApi.update(taskId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        deadline: form.deadline || undefined,
        assignee_id: form.assignee_id || undefined,
      });
      setTask(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!isAdmin) return;
      await tasksApi.delete(taskId);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return <section className="page-stack"><article className="glass-card"><p>Loading task...</p></article></section>;
  }

  if (!task) {
    return <section className="page-stack"><article className="glass-card"><p>{error || 'Task not found'}</p></article></section>;
  }

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Task detail</span>
          <h2>{task.title}</h2>
          <p className="subtle-copy">{task.assignee_name ? `Assigned to ${task.assignee_name}` : 'Currently unassigned'}</p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button" to="/tasks">Back to tasks</Link>
          {isAdmin ? <button className="ghost-block danger" onClick={handleDelete}>Delete task</button> : null}
        </div>
      </div>

      {error ? <article className="glass-card"><p>{error}</p></article> : null}
      {!isAdmin ? <article className="glass-card"><p>Only team admins can reassign or edit tasks. Members can view task details here.</p></article> : null}

      <article className="glass-card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm((state) => ({ ...state, title: e.target.value }))} disabled={!isAdmin} />
          </label>
          <label>
            Description
            <textarea rows="5" value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} disabled={!isAdmin} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm((state) => ({ ...state, status: e.target.value }))} disabled={!isAdmin}>
              {TASK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Assign to
            <select value={form.assignee_id} onChange={(e) => setForm((state) => ({ ...state, assignee_id: e.target.value }))} disabled={!isAdmin}>
              <option value="">Unassigned</option>
              {teamMembers.map((member) => <option key={member.id} value={member.id}>{getMemberDisplayName(member, authUser)}</option>)}
            </select>
          </label>
          <button type="button" className="secondary-button" onClick={() => setForm((state) => ({ ...state, assignee_id: authUser?.id || '' }))} disabled={!isAdmin}>
            Assign to me
          </button>
          <label>
            Deadline
            <input type="date" value={form.deadline || ''} onChange={(e) => setForm((state) => ({ ...state, deadline: e.target.value }))} disabled={!isAdmin} />
          </label>
          <button type="submit" className="primary-button" disabled={saving || !isAdmin}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </article>
    </section>
  );
}

function KanbanPage({ teams }) {
  const authUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(String(teams[0]?.id || ''));
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [error, setError] = useState('');
  const [savingTaskId, setSavingTaskId] = useState(null);
  const dragStateRef = useRef({ taskId: null, dropped: false });
  const isAdmin = getTeamRole(teams, selectedTeam) === 'admin';
  const canMoveTask = (task) => isAdmin || String(task.assignee_id) === String(authUser?.id);

  useEffect(() => {
    if (!selectedTeam) return;
    let active = true;

    projectsApi.getAll(selectedTeam)
      .then((res) => {
        if (!active) return;
        setProjects(res.data);
        setSelectedProject(String(res.data[0]?.id || ''));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load projects');
      });

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    let active = true;

    tasksApi.getAll({ projectId: selectedProject })
      .then((res) => {
        if (active) setTasks(res.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load tasks');
      });

    return () => {
      active = false;
    };
  }, [selectedProject]);

  const moveTaskToStatus = async (taskId, nextStatus) => {
    const task = tasks.find((item) => String(item.id) === String(taskId));
    if (!task || task.status === nextStatus || !canMoveTask(task)) return;

    const previousTasks = tasks;
    setError('');
    setSavingTaskId(taskId);
    setTasks((current) => current.map((item) => (
      String(item.id) === String(taskId) ? { ...item, status: nextStatus } : item
    )));

    try {
      const res = await tasksApi.update(taskId, { status: nextStatus });
      setTasks((current) => current.map((item) => (
        String(item.id) === String(taskId) ? res.data : item
      )));
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Failed to move task');
    } finally {
      setSavingTaskId(null);
      setDraggedTaskId(null);
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Kanban board</span>
          <h2>Tasks by status</h2>
        </div>
        <div className="header-actions">
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </div>
      </div>

      {error ? <article className="glass-card"><p>{error}</p></article> : null}
      {isAdmin ? (
        <article className="glass-card">
          <p>Drag any task card to another column to update its status. You can also assign tasks to yourself from the task forms.</p>
        </article>
      ) : (
        <article className="glass-card">
          <p>You can drag a card only if it is assigned to you. Team admins can move any task on the board.</p>
        </article>
      )}

      <div className="kanban-grid">
        {TASK_STATUSES.map((column) => (
          <article
            key={column}
            className="kanban-column"
            onDragOver={(event) => {
              if (draggedTaskId) event.preventDefault();
              if (draggedTaskId) event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              if (!draggedTaskId) return;
              event.preventDefault();
              event.stopPropagation();
              const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) {
                dragStateRef.current = { taskId, dropped: true };
                moveTaskToStatus(taskId, column);
              }
            }}
          >
            <div className="kanban-head">
              <strong>{column}</strong>
              <span>{tasks.filter((task) => task.status === column).length}</span>
            </div>
            {tasks.filter((task) => task.status === column).map((task) => (
              <div
                key={task.id}
                className="kanban-card"
                draggable={canMoveTask(task)}
                onDragStart={(event) => {
                  if (!canMoveTask(task)) return;
                  event.dataTransfer.setData('text/plain', task.id);
                  event.dataTransfer.effectAllowed = 'move';
                  dragStateRef.current = { taskId: task.id, dropped: false };
                  setDraggedTaskId(task.id);
                }}
                onDragEnd={() => {
                  setDraggedTaskId(null);
                  // Prevent the post-drag click from opening task detail when the user intended to drop.
                  setTimeout(() => {
                    dragStateRef.current = { taskId: null, dropped: false };
                  }, 0);
                }}
                onClick={() => {
                  if (dragStateRef.current.taskId === task.id && dragStateRef.current.dropped) {
                    return;
                  }
                  navigate(`/tasks/${task.id}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/tasks/${task.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <strong>{task.title}</strong>
                {savingTaskId === task.id ? <span>Updating...</span> : null}
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ProjectPage({ teams, view }) {
  if (view === 'projects') return <ProjectsListPage teams={teams} />;
  if (view === 'create-project') return <ProjectCreationForm teams={teams} />;
  if (view === 'project-detail') return <ProjectDetailPage teams={teams} />;
  if (view === 'tasks') return <TasksListPage teams={teams} />;
  if (view === 'task-detail') return <TaskDetailPage teams={teams} />;
  if (view === 'kanban') return <KanbanPage teams={teams} />;
  return null;
}
