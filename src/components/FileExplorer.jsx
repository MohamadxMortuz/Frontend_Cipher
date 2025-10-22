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
    
    setFiles({
      ...files,
      [fileName]: defaultContent
    });
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

      <div style={{padding:'0 16px 12px 16px'}}>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCreatingFile(true)}
          style={{width:'100%', fontSize:'13px'}}
        >
          ➕ New File
        </button>
      </div>

      {isCreatingFile && (
        <div style={{padding:'0 16px 16px 16px', display:'flex', flexDirection:'column', gap:8}}>
          <input 
            className="input" 
            type="text" 
            value={newFileName} 
            onChange={(e)=>setNewFileName(e.target.value)} 
            placeholder="filename.js" 
            style={{fontSize:'13px'}}
            onKeyDown={(e)=>{ 
              if(e.key==='Enter') handleCreateFile(); 
              if(e.key==='Escape'){ setIsCreatingFile(false); setNewFileName(''); } 
            }} 
            autoFocus
          />
          <div style={{display:'flex', gap:6}}>
            <button className="btn btn-success" onClick={handleCreateFile} style={{flex:1, fontSize:'12px'}}>
              ✓ Create
            </button>
            <button 
              className="btn" 
              onClick={() => {setIsCreatingFile(false); setNewFileName('');}}
              style={{background:'var(--muted)', color:'white', fontSize:'12px'}}
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
            className={`file-item ${k===activeFile? 'selected':''}`} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveFile(k);
            }}
            style={{cursor: 'pointer'}}
          >
            <span style={{fontSize:'16px', marginRight:'2px'}}>{getFileIcon(k)}</span>
            <div style={{flex:1, fontSize:'13px'}}>{k}</div>
            <div className="file-controls">
              <button 
                className="btn-icon" 
                onClick={(e)=>{ 
                  e.preventDefault();
                  e.stopPropagation(); 
                  handleDeleteFile(k); 
                }}
                style={{
                  width:'20px', 
                  height:'20px', 
                  fontSize:'10px', 
                  background:'transparent',
                  color:'var(--muted)',
                  padding:'0'
                }}
                title="Delete file"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}