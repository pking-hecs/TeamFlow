import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar     from './components/Navbar.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import TeamsPage  from './pages/Teams.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teams"     element={<TeamsPage />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="*"          element={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'1rem' }}>
            <h1 style={{ fontSize:'4rem', color:'var(--accent)' }}>404</h1>
            <p>Page not found</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
