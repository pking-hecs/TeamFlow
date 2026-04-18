import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut, Users, User } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="glass-nav" style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <Users size={20} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.5px' }}>DBS Project</span>
      </Link>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <User size={18} />
              <span>{user?.username || 'User'}</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{
              color: 'var(--text-main)', textDecoration: 'none', padding: '0.5rem 1rem',
              fontWeight: 500
            }}>Login</Link>
            <Link to="/register" style={{
              background: 'var(--primary)', color: 'white', textDecoration: 'none',
              padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 500,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
            }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
