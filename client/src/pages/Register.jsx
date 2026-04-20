import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setLocalError('Password must contain at least 8 characters, one letter, one number, and one special symbol.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setLocalError('Passwords do not match');
    }

    try {
      const resultAction = await dispatch(registerUser({ 
        username: formData.username, 
        email: formData.email,
        password: formData.password 
      }));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: 'calc(100vh - 120px)'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        padding: '2.5rem', borderRadius: '1rem', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign up to manage your teams</p>
        </div>

        {(error || localError) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {localError || (Array.isArray(error) ? error[0].msg : error)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username" name="username" type="text" className="form-input"
              placeholder="Choose a username" value={formData.username}
              onChange={handleChange} required autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" className="form-input"
              placeholder="Enter your email" value={formData.email}
              onChange={handleChange} required autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" className="form-input"
              placeholder="Min 8 chars, 1 letter, 1 number, 1 symbol" value={formData.password}
              onChange={handleChange} required minLength={8} autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" className="form-input"
              placeholder="Confirm your password" value={formData.confirmPassword}
              onChange={handleChange} required minLength={8} autoComplete="new-password"
            />
          </div>

          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
