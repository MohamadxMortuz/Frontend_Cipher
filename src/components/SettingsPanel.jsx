import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsPanel({ isOpen, onClose }) {
  const { 
    isDarkTheme, 
    toggleTheme, 
    isAutosaveEnabled, 
    toggleAutosave,
    autosaveInterval,
    setAutosaveInterval
  } = useSettings();

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: isDarkTheme ? '#1e1e1e' : '#ffffff',
        color: isDarkTheme ? '#ffffff' : '#000000',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: isDarkTheme ? '#ffffff' : '#000000',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Theme</label>
          <button 
            onClick={toggleTheme}
            style={{
              padding: '8px 16px',
              backgroundColor: isDarkTheme ? '#333' : '#eee',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: isDarkTheme ? '#fff' : '#000'
            }}
          >
            {isDarkTheme ? '🌞 Light' : '🌙 Dark'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Autosave</label>
          <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={isAutosaveEnabled}
              onChange={toggleAutosave}
              style={{ width: '20px', height: '20px' }}
            />
            {isAutosaveEnabled ? 'Enabled' : 'Disabled'}
          </label>
        </div>

        {isAutosaveEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Autosave Interval (seconds)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={autosaveInterval}
              onChange={(e) => setAutosaveInterval(Number(e.target.value))}
              style={{
                padding: '8px',
                backgroundColor: isDarkTheme ? '#333' : '#fff',
                color: isDarkTheme ? '#fff' : '#000',
                border: `1px solid ${isDarkTheme ? '#444' : '#ddd'}`,
                borderRadius: '4px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}