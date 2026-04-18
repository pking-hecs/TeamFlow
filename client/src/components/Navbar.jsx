import React from 'react';
import { NavLink } from 'react-router-dom';
export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" id="nav-logo">
          <div className="logo-icon">⚡</div>
          <span>TeamFlow</span>
        </NavLink>
        <div className="navbar-nav">
          <NavLink to="/dashboard" id="nav-dashboard"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>⊞</span><span>Dashboard</span>
          </NavLink>
          <NavLink to="/teams" id="nav-teams"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>👥</span><span>Teams</span>
          </NavLink>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.8rem',
        }}>U</div>
      </div>
    </nav>
  );
}
