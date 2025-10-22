import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [name,setName]=useState('');
  const [localError,setLocalError]=useState('');
  const { register, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (name.length < 2) {
      setLocalError('Name must be at least 2 characters');
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handle = async (e)=>{
    e.preventDefault();
    setLocalError('');
    if (!validateForm()) return;
    const res = await register(email,password,name);
    if(res.success) navigate('/');
  }

  const error = localError || authError;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join CipherStudio to start coding</p>
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input 
              id="name"
              className="input" 
              required 
              placeholder="John Doe" 
              value={name} 
              onChange={e=>setName(e.target.value)}
              disabled={authLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input 
              id="email"
              className="input" 
              required 
              type="email"
              placeholder="you@example.com" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              disabled={authLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              className="input" 
              required 
              type="password" 
              placeholder="Create a password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              disabled={authLoading}
            />
            <small className="input-help">Must be at least 6 characters</small>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input 
              id="confirmPassword"
              className="input" 
              required 
              type="password" 
              placeholder="Verify your password" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)}
              disabled={authLoading}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button className="btn btn-primary" type="submit" disabled={authLoading}>
              {authLoading ? <span className="spinner-small"></span> : 'Create account'}
            </button>
            <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}