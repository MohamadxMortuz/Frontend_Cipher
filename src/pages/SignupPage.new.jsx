import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    const res = await register(email, password, name);
    if (res.success) navigate('/');
  };

  const error = localError || authError;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>CipherStudio</h1>
        <h2>Sign up</h2>
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <input 
              className="input" 
              required 
              placeholder="Enter name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              disabled={authLoading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <input 
              className="input" 
              required 
              type="email"
              placeholder="Enter email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              disabled={authLoading}
            />
          </div>
          <div className="form-group">
            <input 
              className="input" 
              required 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              disabled={authLoading}
              minLength={6}
            />
            {password && password.length < 6 && (
              <small className="input-help">Password must be at least 6 characters</small>
            )}
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button className="btn btn-primary btn-block" type="submit" disabled={authLoading}>
              {authLoading ? <span className="spinner-small"></span> : 'Sign up'}
            </button>
            <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}