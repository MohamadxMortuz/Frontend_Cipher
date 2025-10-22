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
        className="btn-icon" 
        onClick={()=>setOpen(v=>!v)} 
        title="Profile" 
        aria-label="Profile"
        style={{
          background: open ? 'rgba(49, 130, 206, 0.1)' : 'transparent',
          border: '2px solid transparent',
          borderColor: open ? 'var(--btn-primary)' : 'transparent'
        }}
      >
        <span style={{
          display:'inline-block',
          width:32,
          height:32,
          lineHeight:'32px',
          borderRadius:'50%',
          background:'var(--btn-primary)',
          color:'#fff',
          textAlign:'center',
          fontWeight:600,
          fontSize:'14px',
          boxShadow:'var(--shadow-sm)'
        }}>
          {initials}
        </span>
      </button>
      {open && (
        <div className="profile-menu">
          <div style={{
            padding:'16px',
            borderBottom:'1px solid var(--border-color)',
            position:'relative',
            zIndex:1
          }}>
            <div style={{
              fontWeight:600,
              fontSize:'15px',
              color:'var(--text-color)',
              marginBottom:'4px'
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize:'13px',
              color:'var(--muted)'
            }}>
              {user?.email || ''}
            </div>
          </div>
          <div style={{position:'relative', zIndex:1}}>
            <button 
              className="btn" 
              onClick={()=>{ logout(); setOpen(false); }}
              style={{
                color:'var(--btn-danger)'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}