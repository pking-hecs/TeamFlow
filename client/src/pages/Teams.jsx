import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { createTeam } from '../store/teamsSlice.js';
import { getStoredLogo, readFileAsDataUrl, saveStoredLogo } from '../utils/logoStorage.js';

export default function TeamsPage({ teams, workspace }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const created = await dispatch(createTeam({ name: name.trim(), description: description.trim() })).unwrap();
    if (logoFile) {
      const dataUrl = await readFileAsDataUrl(logoFile);
      saveStoredLogo('team', created.id, dataUrl);
    }
    setName('');
    setDescription('');
    setLogoFile(null);
    setShowForm(false);
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Team management</span>
          <h2>Teams list page</h2>
          <p className="subtle-copy">Create teams, browse existing groups, and jump into members or settings.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm((open) => !open)}>
          {showForm ? 'Close form' : 'Create new team'}
        </button>
      </div>

      {showForm && (
        <article className="glass-card form-card">
          <form className="form-grid" onSubmit={handleCreate}>
            <label>
              Team name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter team name" />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="What does this team own?" />
            </label>
            <label>
              Team logo
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" className="primary-button">Save team</button>
          </form>
        </article>
      )}

      <div className="team-list-grid">
        {teams.map((team) => {
          const projectCount = workspace.projects.filter((project) => project.teamId === team.id).length;
          const logo = getStoredLogo('team', team.id);
          return (
            <article key={team.id} className="glass-card team-list-card">
              <div className="team-list-head">
                <div className="team-avatar large">
                  {logo ? <img src={logo} alt={`${team.name} logo`} /> : team.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3>{team.name}</h3>
                  <p>{team.description || 'No description yet.'}</p>
                </div>
              </div>
              <div className="detail-list compact">
                <div><span>Members</span><strong>{team.member_count || 0}</strong></div>
                <div><span>Projects</span><strong>{projectCount}</strong></div>
              </div>
              <div className="card-actions">
                <Link className="secondary-button" to={`/teams/${team.id}`}>Open team</Link>
                <Link className="text-action" to={`/teams/${team.id}/settings`}>Settings</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
