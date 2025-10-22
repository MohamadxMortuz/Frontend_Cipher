import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useSettings } from "../contexts/SettingsContext";

function InnerEditor({ activeFile }) {
  const { sandpack, updateFile, dispatch } = useSandpack();
  const [currentFile, setCurrentFile] = useState(activeFile);

  useEffect(() => {
    if (activeFile && sandpack.files[activeFile] && activeFile !== currentFile) {
      dispatch({ type: 'set-active-file', path: activeFile });
      setCurrentFile(activeFile);
    }
  }, [activeFile, dispatch, sandpack.files, currentFile]);

  return (
    <SandpackCodeEditor
      showLineNumbers
      showInlineErrors
      showTabs
      key={activeFile}
      onChange={(code) => {
        try {
          updateFile(activeFile, code || "");
        } catch (e) {
          // ignore
        }
      }}
      style={{
        height: "100%",
        width: "100%"
      }}
    />
  );
}

export default function EditorPane({ files = {}, setFiles, activeFile, setActiveFile, projectId }) {
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = localStorage.getItem('cipherstudio:editorWidth');
    return saved ? parseInt(saved, 10) : 50;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Build sandpack files object (string values are accepted)
  const origSandpackFiles = {};
  Object.keys(files).forEach((k) => {
    const content = typeof files[k] === "string" ? files[k] : files[k].code || "";
    origSandpackFiles[k] = content;
  });

  // Memoize the provider files by projectId so the provider doesn't reinitialize
  // on every keystroke (which causes flicker and typing issues).
  const sandpackFiles = React.useMemo(() => {
    return { ...origSandpackFiles };
  }, [JSON.stringify(origSandpackFiles), activeFile]);
  const { isDarkTheme } = useSettings();

  // Save editor width to localStorage
  useEffect(() => {
    localStorage.setItem('cipherstudio:editorWidth', editorWidth.toString());
  }, [editorWidth]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 25% and 75%
    const constrainedWidth = Math.min(Math.max(newWidth, 25), 75);
    setEditorWidth(Math.round(constrainedWidth));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetLayout = useCallback(() => {
    setEditorWidth(50);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => {
        e.preventDefault();
        handleMouseMove(e);
      };
      
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('resizing');
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.classList.remove('resizing');
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Build a theme stylesheet that will be injected into the Sandpack preview
  // so the preview iframe uses the same background/text colors as the app.
  const previewThemeCss = React.useMemo(() => {
    // Stronger stylesheet injected into the preview iframe to match CodeSandbox UI
    const bg = isDarkTheme ? '#0b1220' : '#ffffff';
    const panelBg = isDarkTheme ? '#0f1722' : '#ffffff';
    const toolbarBg = isDarkTheme ? '#0b1220' : '#f3f4f6';
    const text = isDarkTheme ? '#e6edf3' : '#111827';
    const muted = isDarkTheme ? '#9ca3af' : '#6b7280';
    const border = isDarkTheme ? '#1f2937' : '#e5e7eb';

    return `
/* Preview page base */
html,body{height:100%;margin:0;background:${bg} !important;color:${text} !important;font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial !important}
/* Make main preview area white (or dark) */
body > * { background: ${panelBg} !important; color: ${text} !important }

/* Toolbar / actions */
.sp-preview .sp-actions, .sp-preview .sp-toolbar, .sandbox-actions { background: ${toolbarBg} !important; border-top: 1px solid ${border} !important; }
.sp-preview .sp-actions button, .sp-preview .sp-toolbar button, .sandbox-actions button { background: transparent !important; color: ${muted} !important; border: none !important; }
.sp-preview .sp-actions button:hover, .sp-preview .sp-toolbar button:hover, .sandbox-actions button:hover { color: ${text} !important; }

/* Make action buttons rounded like CodeSandbox */
.sp-preview .sp-actions button, .sp-preview .sp-toolbar button { border-radius: 999px !important; padding: 6px 8px !important; }

/* Tabs (code area) */
.sp-tabs { background: ${toolbarBg} !important; border-bottom: 1px solid ${border} !important }
.sp-tab { color: ${muted} !important }
.sp-tab.sp-tab-active, .sp-tab-active { color: ${text} !important; font-weight: 600 !important }

/* Ensure preview content scrolls and doesn't overflow */
.sp-preview, .sp-preview iframe, .preview-root { overflow: auto !important; }

/* Buttons in preview (open, refresh) */
.sp-preview .sp-actions .sp-action, .open-sandbox { background: rgba(0,0,0,0.32) !important; color: ${text} !important }
.sp-preview .sp-actions .sp-action:hover { background: rgba(0,0,0,0.46) !important }

/* Make icons inherit color */
.sp-preview svg, .sp-preview .sp-action svg { fill: currentColor !important; stroke: currentColor !important }

/* Small helpers */
pre, code { color: inherit !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'SF Pro Text', monospace !important }
`;
  }, [isDarkTheme]);

  // Create a copy of the sandpack files and ensure index.js imports index.css
  const sandpackFilesWithTheme = React.useMemo(() => {
    const copy = { ...sandpackFiles };
    // ensure index.js imports index.css at the top so styles apply in preview
    if (copy['index.js'] && !copy['index.js'].includes("import './index.css'")) {
      copy['index.js'] = "import './index.css';\n" + copy['index.js'];
    }
    copy['index.css'] = previewThemeCss;
    return copy;
  }, [sandpackFiles, previewThemeCss]);

  // When Sandpack updates files internally, we need to reflect that back to parent state.
  // We'll use the provider's onUpdate callback via a small bridge component.

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      background: 'var(--bg)'
    }}>
      <SandpackProvider
        template="react"
        files={sandpackFilesWithTheme}
        options={{ autorun: true, activeFile }}
        theme={isDarkTheme ? 'dark' : 'light'}
        key={activeFile}
      >
    {/* Make the Sandpack area taller (60vh) so editor + preview get more vertical space */}
    <SandpackLayout 
      style={{ 
        height: "calc(100vh - 60px)", 
        background: 'var(--bg)'
      }}
    >
      <Bridge setFiles={setFiles} setActiveFile={setActiveFile} />
      <div 
        ref={containerRef}
        className="editor-container"
        style={{ 
          display: "flex", 
          height: "100%", 
          overflow: "hidden", 
          flex: 1,
          position: 'relative'
        }}
      >
        {/* Editor Section */}
        <div 
          className="editor-section"
          style={{ 
            width: `${editorWidth}%`, 
            minWidth: 0,
            flex: 'none',
            display: "flex", 
            flexDirection: "column" 
          }}>
          <InnerEditor activeFile={activeFile} />
        </div>
        
        {/* Resizer */}
        <div 
          className={`editor-resizer ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          title="Drag to resize editor and preview panels"
        >
          <div className="editor-resizer-handle" />
        </div>
        
        {/* Preview Section */}
        <div 
          className="preview-section"
          style={{ 
            width: `${100 - editorWidth}%`, 
            minWidth: 0,
            flex: 'none',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
          <SandpackPreview style={{ height: "100%", width: '100%' }} />
        </div>
      </div>
    </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

function Bridge({ setFiles, setActiveFile }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!sandpack || !sandpack.files) return;

    // Debounce updates to avoid flooding parent setFiles while typing
    let mounted = true;
    const id = setTimeout(() => {
      if (!mounted) return;
      const mapped = {};
      Object.keys(sandpack.files || {}).forEach((k) => {
        mapped[k] = sandpack.files[k].code || sandpack.files[k];
      });
      setFiles(mapped);
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(id);
    };
  }, [sandpack.files, setFiles, sandpack]);

  // Sync active file from Sandpack to parent
  useEffect(() => {
    if (sandpack.activeFile && setActiveFile) {
      setActiveFile(sandpack.activeFile);
    }
  }, [sandpack.activeFile, setActiveFile]);

  return null;
}