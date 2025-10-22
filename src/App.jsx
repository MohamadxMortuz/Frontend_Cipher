import React, { useEffect, useState, useCallback, Suspense } from "react";
import FileExplorer from "./components/FileExplorer";
const EditorPane = React.lazy(()=>import('./components/EditorPane'));
const PreviewPane = React.lazy(()=>import('./components/PreviewPane'));
import SettingsPanel from "./components/SettingsPanel";
import AuthModal from "./components/AuthModal";
import ProfileMenu from './components/ProfileMenu';
import { useSettings } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const DEFAULT_FILES = {
  "index.js": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")).render(<App />);`,
  "App.jsx": `import React from "react";
export default function App(){ return <div style={{padding:20}}>Hello from CipherStudio</div> }`,
  "package.json": `{"name":"cipherstudio","version":"1.0.0","dependencies":{"react":"^18.2.0","react-dom":"^18.2.0"}}`
};

function makeProjectId(){ return uuidv4().split("-")[0]; }

export default function App(){
  const [projectId, setProjectId] = useState(() => {
    try {
      const savedId = localStorage.getItem('cipherstudio:activeProjectId');
      return savedId || makeProjectId();
    } catch (e) {
      return makeProjectId();
    }
  });
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState("App.jsx");
  const [backendUrl, setBackendUrl] = useState("http://localhost:4000");
  useEffect(()=>{
    const saved = localStorage.getItem('cipherstudio:backend');
    if(saved) setBackendUrl(saved);
  },[]);

  useEffect(()=>{
    localStorage.setItem('cipherstudio:backend', backendUrl);
    // set axios base for API calls
    try{ require('axios').defaults.baseURL = backendUrl; }catch(e){}
  },[backendUrl]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isDarkTheme, isAutosaveEnabled, autosaveInterval, toggleTheme } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(()=>{
    const saved = localStorage.getItem("cipherstudio:" + projectId);
    if(saved){ setFiles(JSON.parse(saved)); }
    // persist the active project id so we restore it on refresh
    try { localStorage.setItem('cipherstudio:activeProjectId', projectId); } catch(e){}
  }, [projectId]);

  const saveToStorage = useCallback(() => {
    localStorage.setItem("cipherstudio:" + projectId, JSON.stringify(files));
  }, [files, projectId]);

  // Manual save effect
  useEffect(() => {
    if (!isAutosaveEnabled) {
      saveToStorage();
    }
  }, [files, isAutosaveEnabled, saveToStorage]);

  // Autosave effect
  useEffect(() => {
    if (!isAutosaveEnabled) return;
    
    const timer = setInterval(() => {
      saveToStorage();
    }, autosaveInterval * 1000);

    return () => clearInterval(timer);
  }, [isAutosaveEnabled, autosaveInterval, saveToStorage]);

  // Theme managed in SettingsProvider

  async function saveProject(){
    try{
      if(!backendUrl) return alert("Set backend URL in top-right (or deploy backend).");
      const payload = { projectId, files, title: "CipherStudio " + projectId };
      await axios.post(`${backendUrl}/api/projects/save`, payload);
      alert("Project saved successfully!");
    }catch(e){ alert("Save failed: " + (e.message||e)); }
  }

  async function loadProject(id){
    try{
      if(!backendUrl) return alert("Set backend URL.");
      const res = await axios.get(`${backendUrl}/api/projects/load/${id}`);
      if(res.data && res.data.files){ 
        setFiles(res.data.files); 
        setProjectId(res.data.projectId || id);
        alert("Project loaded successfully!");
      }
      else alert("No project found.");
    } catch(e){ 
      alert("Load failed: " + (e.message||e)); 
    }
  }

  // Check if user is authenticated and not on auth pages
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

  return (
    <div className="app-container">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route path="/editor" element={
          <ProtectedRoute>
            <>
              <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
              <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

              <div className="toolbar">
                <h1>CipherStudio</h1>

                <div className="toolbar-section">
                  <button className="btn btn-success" onClick={saveProject}>
                    💾 Save Project
                  </button>
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Enter Project ID to load..." 
                    onKeyDown={(e)=>{ if(e.key==='Enter') loadProject(e.target.value); }} 
                  />
                </div>

                <div className="toolbar-right">
                  <div className="toolbar-section">
                    <label style={{color:'var(--muted)', fontSize:'14px', fontWeight:'500'}}>Backend:</label>
                    <input 
                      className="input" 
                      value={backendUrl} 
                      onChange={(e)=>setBackendUrl(e.target.value)} 
                      placeholder="Backend URL"
                    />
                  </div>

                  <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
                    {isDarkTheme? '🌞' : '🌙'}
                  </button>
                  <button className="btn-icon" onClick={()=>setIsSettingsOpen(true)} title="Settings">
                    ⚙️
                  </button>
                  <ProfileMenu />
                </div>
              </div>

              <div className="main">
                <div className="file-explorer">
                  <FileExplorer files={files} setFiles={setFiles} activeFile={activeFile} setActiveFile={setActiveFile} />
                </div>
                <div className="editor-pane">
                  <Suspense fallback={<div className="editor-placeholder"><div className="spinner"/></div>}>
                    <EditorPane files={files} setFiles={setFiles} activeFile={activeFile} setActiveFile={setActiveFile} projectId={projectId} />
                  </Suspense>
                </div>
              </div>
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}