import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileMenu(){
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e){
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const initials = (user?.name || 'User')
    .split(' ')
    .map(x => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{position:'relative'}} ref={ref}>
      <button 
        className="btn p-0" 
        onClick={()=>setOpen(v=>!v)} 
        title="Profile" 
        aria-label="Profile"
      >
        <div className="profile-avatar">
          {initials}
        </div>
      </button>
      {open && (
        <div className="profile-menu">
          <div className="p-3 border-bottom">
            <div className="fw-semibold mb-1" style={{color:'var(--text-color)'}}>
              {user?.name || 'User'}
            </div>
            <div className="small text-muted">
              {user?.email || ''}
            </div>
          </div>
          <div>
            <button 
              className="btn text-danger" 
              onClick={()=>{ logout(); setOpen(false); }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}