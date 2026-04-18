import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  formatShortDate,
  getFilteredTasks,
  getProject,
  getProjectTasks,
  getTask,
} from '../data/mockWorkspace.js';

function ProjectsListPage({ teams, workspace }) {
  const [selectedTeam, setSelectedTeam] = useState(String(teams[0]?.id || ''));

  const projects = useMemo(
    () => workspace.projects.filter((project) => !selectedTeam || String(project.teamId) === selectedTeam),
    [selectedTeam, workspace.projects],
  );

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Project management</span>
          <h2>Projects list page</h2>
        </div>
        <div className="header-actions">
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <Link to="/projects/new" className="primary-button">Create project</Link>
        </div>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article key={project.id} className="glass-card project-row">
            <div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <div className="project-row-meta">
              <span>Deadline {formatShortDate(project.deadline)}</span>
              <span>{project.progress}% complete</span>
              <Link className="secondary-button" to={`/projects/${project.id}`}>Open</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCreationForm({ teams }) {
  const [form, setForm] = useState({
    teamId: String(teams[0]?.id || ''),
    name: '',
    description: '',
    deadline: '2026-05-20',
  });

  return (
    <section className="page-stack">
      <article className="glass-card form-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Project creation form</span>
            <h2>Create a project</h2>
          </div>
          <Link className="secondary-button" to="/projects">Back to projects</Link>
        </div>

        <form className="form-grid">
          <label>
            Team
            <select value={form.teamId} onChange={(e) => setForm((state) => ({ ...state, teamId: e.target.value }))}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>
          <label>
            Project name
            <input value={form.name} onChange={(e) => setForm((state) => ({ ...state, name: e.target.value }))} placeholder="Website relaunch" />
          </label>
          <label>
            Description
            <textarea rows="4" value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} placeholder="Add project summary" />
          </label>
          <label>
            Deadline
            <input type="date" value={form.deadline} onChange={(e) => setForm((state) => ({ ...state, deadline: e.target.value }))} />
          </label>
          <button type="button" className="primary-button">Save project</button>
        </form>
      </article>
    </section>
  );
}

function ProjectDetailPage({ workspace }) {
  const { projectId } = useParams();
  const project = getProject(workspace, projectId);
  const tasks = getProjectTasks(workspace, projectId);

  if (!project) return null;

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Project detail page</span>
          <h2>{project.name}</h2>
          <p className="subtle-copy">{project.description}</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button">Edit project</button>
          <button className="ghost-block danger">Delete project</button>
        </div>
      </div>

      <article className="glass-card">
        <div className="detail-list compact">
          <div><span>Owner</span><strong>{project.owner}</strong></div>
          <div><span>Deadline</span><strong>{formatShortDate(project.deadline)}</strong></div>
          <div><span>Associated tasks</span><strong>{tasks.length}</strong></div>
        </div>
      </article>

      <article className="glass-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Tasks</span>
            <h3>Associated tasks</h3>
          </div>
        </div>
        <div className="project-list">
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-row">
              <div>
                <strong>{task.title}</strong>
                <span>{task.status} · {task.priority}</span>
              </div>
              <span>{task.assignee}</span>
            </Link>
          ))}
        </div>
      </article>
    </section>
  );
}

function TasksListPage({ workspace }) {
  const [filters, setFilters] = useState({ status: 'All', assignee: 'All', priority: 'All' });
  const tasks = getFilteredTasks(workspace, filters);
  const assignees = ['All', ...new Set(workspace.tasks.map((task) => task.assignee))];

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Task management</span>
          <h2>Task list view</h2>
        </div>
        <Link to="/kanban" className="secondary-button">Open Kanban</Link>
      </div>

      <article className="glass-card">
        <div className="filter-row">
          <select value={filters.status} onChange={(e) => setFilters((state) => ({ ...state, status: e.target.value }))}>
            {['All', 'To Do', 'In Progress', 'Done'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.assignee} onChange={(e) => setFilters((state) => ({ ...state, assignee: e.target.value }))}>
            {assignees.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((state) => ({ ...state, priority: e.target.value }))}>
            {['All', 'High', 'Medium', 'Low'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="project-list">
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-row">
              <div>
                <strong>{task.title}</strong>
                <span>{task.description}</span>
              </div>
              <div className="task-tags">
                <span className="soft-pill">{task.status}</span>
                <span className="soft-pill">{task.priority}</span>
                <span>{task.assignee}</span>
              </div>
            </Link>
          ))}
        </div>
      </article>

      <article className="glass-card form-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Task creation form</span>
            <h3>Create a task</h3>
          </div>
        </div>
        <form className="form-grid">
          <label>Task title<input placeholder="Write user story" /></label>
          <label>Description<textarea rows="3" placeholder="Add task details" /></label>
          <label>Priority<select><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label>Deadline<input type="date" defaultValue="2026-05-16" /></label>
          <label>Assignee<select>{assignees.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
          <button type="button" className="primary-button">Save task</button>
        </form>
      </article>
    </section>
  );
}

function TaskDetailPage({ workspace }) {
  const { taskId } = useParams();
  const task = getTask(workspace, taskId);
  const [draft, setDraft] = useState(task);

  if (!task || !draft) return null;

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Task detail page</span>
          <h2>{task.title}</h2>
        </div>
        <button className="ghost-block danger">Delete task</button>
      </div>

      <div className="content-grid two-up">
        <article className="glass-card form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Inline editing</span>
              <h3>Edit task info</h3>
            </div>
          </div>
          <form className="form-grid">
            <label>Title<input value={draft.title} onChange={(e) => setDraft((state) => ({ ...state, title: e.target.value }))} /></label>
            <label>Description<textarea rows="5" value={draft.description} onChange={(e) => setDraft((state) => ({ ...state, description: e.target.value }))} /></label>
            <label>Priority<select value={draft.priority} onChange={(e) => setDraft((state) => ({ ...state, priority: e.target.value }))}><option>High</option><option>Medium</option><option>Low</option></select></label>
            <label>Status<select value={draft.status} onChange={(e) => setDraft((state) => ({ ...state, status: e.target.value }))}><option>To Do</option><option>In Progress</option><option>Done</option></select></label>
          </form>
        </article>

        <article className="glass-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Comments section</span>
              <h3>Team discussion</h3>
            </div>
          </div>
          <div className="comment-list">
            {task.comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <strong>{comment.author}</strong>
                <p>{comment.text}</p>
                <span>{comment.time}</span>
              </div>
            ))}
          </div>
          <textarea rows="3" placeholder="Write a comment" />
        </article>
      </div>
    </section>
  );
}

function KanbanPage({ workspace }) {
  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Kanban board</span>
          <h2>Board layout</h2>
        </div>
      </div>

      <div className="kanban-grid">
        {columns.map((column) => (
          <article key={column} className="kanban-column">
            <div className="kanban-head">
              <strong>{column}</strong>
              <span>{workspace.tasks.filter((task) => task.status === column).length}</span>
            </div>
            {workspace.tasks.filter((task) => task.status === column).map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="kanban-card">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <div className="task-tags">
                  <span className="soft-pill">{task.priority}</span>
                  <span>{task.assignee}</span>
                </div>
              </Link>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ProjectPage({ teams, workspace, view }) {
  if (view === 'projects') return <ProjectsListPage teams={teams} workspace={workspace} />;
  if (view === 'create-project') return <ProjectCreationForm teams={teams} />;
  if (view === 'project-detail') return <ProjectDetailPage workspace={workspace} />;
  if (view === 'tasks') return <TasksListPage workspace={workspace} />;
  if (view === 'task-detail') return <TaskDetailPage workspace={workspace} />;
  if (view === 'kanban') return <KanbanPage workspace={workspace} />;
  return null;
}
