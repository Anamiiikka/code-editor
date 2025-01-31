import React from 'react';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Toolbar />
      <div className="flex-1">
        <Editor />
      </div>
    </div>
  );
}

export default App;