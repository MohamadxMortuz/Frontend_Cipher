# CipherStudio Frontend

React-based code editor with live preview using Vite and Sandpack.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Tech Stack

- React 18 + Vite
- Sandpack (code editor)
- React Router
- Axios for API calls

## Features

- Code editor with syntax highlighting
- Live preview with hot reload
- Resizable editor panels (25%-75%)
- File management (create/delete/switch)
- Dark/light theme support
- User authentication
- Responsive design

## Environment Variables

```env
VITE_API_URL=http://localhost:4000
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## Key Components

- `EditorPane` - Main code editor with Sandpack
- `FileExplorer` - File sidebar with icons
- `AuthContext` - Authentication state management