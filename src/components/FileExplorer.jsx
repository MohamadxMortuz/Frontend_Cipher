import React, { useState } from "react";

export default function FileExplorer({files, setFiles, activeFile, setActiveFile}){
  const [newFileName, setNewFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const keys = Object.keys(files);

  const handleCreateFile = () => {
    if (!newFileName) return;
    const fileName = newFileName.endsWith('.js') || newFileName.endsWith('.jsx') || newFileName.endsWith('.css') 
      ? newFileName 
      : `${newFileName}.js`;
    
    if (files[fileName]) {
      alert('File already exists!');
      return;
    }

    const defaultContent = fileName.endsWith('.css') 
      ? '/* Add your styles here */'
      : fileName.endsWith('.json')
      ? '{}'
      : '// Write your code here';
    
    const updatedFiles = {
      ...files,
      [fileName]: defaultContent
    };
    
    setFiles(updatedFiles);
    // Update localStorage immediately
    const projectId = localStorage.getItem('cipherstudio:activeProjectId');
    if (projectId) {
      localStorage.setItem("cipherstudio:" + projectId, JSON.stringify(updatedFiles));
    }
    setActiveFile(fileName);
    setNewFileName("");
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (k) => {
    const ok = confirm("Delete " + k + "?");
    if (ok) {
      const copy = {...files};
      delete copy[k];
      setFiles(copy);
      // Update localStorage immediately
      const projectId = localStorage.getItem('cipherstudio:activeProjectId');
      if (projectId) {
        localStorage.setItem("cipherstudio:" + projectId, JSON.stringify(copy));
      }
      if (activeFile === k) setActiveFile(Object.keys(copy)[0] || "");
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return '⚛️';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.md')) return '📝';
    return '📄';
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3 className="file-explorer-title">Explorer</h3>
      </div>

      <div className="px-3 pb-3">
        <button 
          className="btn btn-primary btn-sm w-100" 
          onClick={() => setIsCreatingFile(true)}
        >
          ➕ New File
        </button>
      </div>

      {isCreatingFile && (
        <div className="px-3 pb-3">
          <input 
            className="form-control form-control-sm mb-2" 
            type="text" 
            value={newFileName} 
            onChange={(e)=>setNewFileName(e.target.value)} 
            placeholder="filename.js" 
            onKeyDown={(e)=>{ 
              if(e.key==='Enter') handleCreateFile(); 
              if(e.key==='Escape'){ setIsCreatingFile(false); setNewFileName(''); } 
            }} 
            autoFocus
          />
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm flex-fill" onClick={handleCreateFile}>
              ✓ Create
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {setIsCreatingFile(false); setNewFileName('');}}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={{overflowY:'auto', flex:1}}>
        {keys.map(k => (
          <div 
            key={k} 
            className={`file-item d-flex align-items-center rounded ${k===activeFile? 'selected':''}`} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveFile(k);
            }}
            style={{cursor: 'pointer'}}
          >
            <span className="me-2">{getFileIcon(k)}</span>
            <div className="flex-fill small">{k}</div>
            <button 
              className="btn btn-sm p-0" 
              onClick={(e)=>{ 
                e.preventDefault();
                e.stopPropagation(); 
                handleDeleteFile(k); 
              }}
              style={{
                width:'20px', 
                height:'20px', 
                background:'transparent',
                color:'var(--muted)',
                border: 'none'
              }}
              title="Delete file"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
