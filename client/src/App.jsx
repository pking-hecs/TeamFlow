import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) return <div>Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/teams" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/teams" 
            element={
              <PrivateRoute>
                <Teams />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
