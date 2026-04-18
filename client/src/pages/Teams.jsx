import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTeams } from '../store/teamsSlice';
import TeamCard from '../components/TeamCard';
import { Plus } from 'lucide-react';

const Teams = () => {
  const dispatch = useDispatch();
  const { items: teams, loading, error } = useSelector(state => state.teams);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchUserTeams());
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '0.5rem' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Teams</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Welcome back, {user?.username}. Here are the teams you belong to.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No teams found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You don't belong to any teams yet.</p>
          <button className="btn btn-primary">Create Your First Team</button>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem'
        }}>
          {teams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
