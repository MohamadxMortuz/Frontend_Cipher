import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  // Initialize theme from localStorage or system preference
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('cipherstudio:theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });
  
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(true);
  const [autosaveInterval, setAutosaveInterval] = useState(30); // seconds

  useEffect(() => {
    // Load other settings from localStorage
    const savedSettings = localStorage.getItem('cipherstudio:settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (typeof settings.isAutosaveEnabled === 'boolean') setIsAutosaveEnabled(settings.isAutosaveEnabled);
        if (typeof settings.autosaveInterval === 'number') setAutosaveInterval(settings.autosaveInterval);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Apply and save theme changes
  useEffect(() => {
    const theme = isDarkTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cipherstudio:theme', theme);
  }, [isDarkTheme]);

  // Save other settings
  useEffect(() => {
    const settings = {
      isDarkTheme,
      isAutosaveEnabled,
      autosaveInterval
    };
    localStorage.setItem('cipherstudio:settings', JSON.stringify(settings));
  }, [isDarkTheme, isAutosaveEnabled, autosaveInterval]);

  const toggleTheme = () => setIsDarkTheme(prev => !prev);
  const toggleAutosave = () => setIsAutosaveEnabled(prev => !prev);

  return (
    <SettingsContext.Provider value={{
      isDarkTheme,
      toggleTheme,
      isAutosaveEnabled,
      toggleAutosave,
      autosaveInterval,
      setAutosaveInterval
    }}>
      {children}
    </SettingsContext.Provider>
  );
}