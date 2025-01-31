import React from 'react';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { FileExplorer } from './components/FileExplorer';

function App() {
  return (
    <div className="flex h-screen bg-gray-900">
      <FileExplorer />
      <div className="flex flex-col flex-1">
        <Toolbar />
        <Editor />
      </div>
    </div>
  );
}

export default App;
