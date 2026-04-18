import React from 'react';
import { Users, MoreVertical } from 'lucide-react';

const TeamCard = ({ team }) => {
  return (
    <div className="glass-panel" style={{
      padding: '1.5rem', borderRadius: '1rem', transition: 'all 0.3s', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: '1rem'
    }}
    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)',
            padding: '0.75rem', borderRadius: '0.75rem' 
          }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{team.name}</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {team.id}</span>
          </div>
        </div>
        <button style={{ 
          background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' 
        }}>
          <MoreVertical size={20} />
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, flex: 1 }}>
        {team.description || "No description provided."}
      </p>

      <div style={{ 
        marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>{team.members?.length || 0}</strong> Members
        </div>
        <button style={{
          background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none',
          padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem',
          cursor: 'pointer', transition: 'background 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          View Team
        </button>
      </div>
    </div>
  );
};

export default TeamCard;
