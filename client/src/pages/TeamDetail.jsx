import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTeamMember, removeTeamMember, updateTeam } from '../store/teamsSlice.js';
import { getTeamMembers, getTeamProjects } from '../data/mockWorkspace.js';

function TeamMembersPanel({ team }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const members = useMemo(() => getTeamMembers(team), [team]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    await dispatch(addTeamMember({ teamId: team.id, email: email.trim(), role }));
    setEmail('');
  };

  return (
    <div className="page-stack">
      <article className="glass-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Team detail page</span>
            <h2>{team.name}</h2>
            <p className="subtle-copy">{team.description || 'This team currently has no description.'}</p>
          </div>
          <Link className="secondary-button" to={`/teams/${team.id}/settings`}>Team settings</Link>
        </div>

        <div className="member-table">
          <div className="member-row header">
            <span>Member</span>
            <span>Role</span>
            <span>Join date</span>
            <span>Action</span>
          </div>
          {members.map((member) => (
            <div key={member.id} className="member-row">
              <div className="member-id">
                <div className="team-avatar tiny">{member.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
              </div>
              <span>{member.role}</span>
              <span>{member.joinedAt}</span>
              <button
                className="text-action danger"
                onClick={() => dispatch(removeTeamMember({ teamId: team.id, userId: member.id }))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card form-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Admins</span>
            <h3>Add or remove members</h3>
          </div>
        </div>
        <form className="inline-form" onSubmit={handleAdd}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@berun.app" />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="primary-button">Add member</button>
        </form>
      </article>
    </div>
  );
}

function TeamSettingsPanel({ team }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');
  const [iconName, setIconName] = useState('No file chosen');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(updateTeam({ id: team.id, data: { name: name.trim(), description: description.trim() } }));
  };

  return (
    <article className="glass-card form-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Team settings page</span>
          <h2>Edit team profile</h2>
          <p className="subtle-copy">Update the team name, description, and icon placeholder from one place.</p>
        </div>
        <Link className="secondary-button" to={`/teams/${team.id}`}>Back to detail</Link>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Team name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Description
          <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Team icon
          <input
            type="file"
            onChange={(e) => setIconName(e.target.files?.[0]?.name || 'No file chosen')}
          />
          <small>{iconName}</small>
        </label>
        <button type="submit" className="primary-button">Save settings</button>
      </form>
    </article>
  );
}

export default function TeamDetail({ teams, workspace, mode = 'detail' }) {
  const { id } = useParams();
  const team = teams.find((item) => String(item.id) === String(id)) || teams[0];
  const projects = getTeamProjects(workspace, team?.id);

  if (!team) {
    return (
      <section className="page-stack">
        <article className="glass-card">
          <h2>No team available</h2>
        </article>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <span className="eyebrow">Workspace snapshot</span>
          <h2>{team.name}</h2>
          <p>{team.description || 'A dedicated team workspace for projects, tasks, and collaboration.'}</p>
        </div>
        <div className="hero-metrics">
          <div><strong>{team.member_count || 0}</strong><span>Members</span></div>
          <div><strong>{projects.length}</strong><span>Projects</span></div>
        </div>
      </div>

      {mode === 'settings' ? <TeamSettingsPanel team={team} /> : <TeamMembersPanel team={team} />}
    </section>
  );
}
