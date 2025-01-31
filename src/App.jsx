import React from 'react';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { FileExplorer } from './components/FileExplorer';
import { TerminalComponent } from './components/Terminal'; 
import { useEditorStore } from './store/editorStore';

function App() {
  const { showTerminal } = useEditorStore(); // Get the terminal visibility state

  return (
    <div className="flex h-screen bg-gray-900">
      <FileExplorer />
      <div className="flex flex-col flex-1">
        <Toolbar />
        <Editor />
        {showTerminal && ( // Conditionally render the terminal
          <div className="h-1/3 bg-black p-2">
            <TerminalComponent />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;