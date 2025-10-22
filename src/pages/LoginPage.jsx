import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage(){
  console.log('LoginPage rendering'); // Debug log
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [localError,setLocalError]=useState('');
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handle = async (e)=>{
    e.preventDefault();
    setLocalError('');
    if (!validateForm()) return;
    const res = await login(email,password);
    if(res.success) navigate('/');
  }

  const devToken = async ()=>{
    try{
      const backend = localStorage.getItem('cipherstudio:backend') || '';
      const res = await axios.post(backend + '/api/auth/dev-token', { userId: 'dev-user' });
      const token = res.data.token;
      localStorage.setItem('cipherstudio:token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/');
    }catch(e){ setLocalError('Dev token failed: ' + (e.message||e)); }
  }

  const error = localError || authError;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>CipherStudio</h1>
        <h2>Login</h2>
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <input 
              className="input" 
              required 
              type="email"
              placeholder="Email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              disabled={authLoading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <input 
              className="input" 
              required 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              disabled={authLoading}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button className="btn btn-primary btn-block" type="submit" disabled={authLoading}>
              {authLoading ? <span className="spinner-small"></span> : 'Login'}
            </button>
            <Link to="/signup" className="auth-link">Create new account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}