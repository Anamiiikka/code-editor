import React from 'react';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { FileExplorer } from './components/FileExplorer';
import { TerminalComponent } from './components/Terminal'; // Import the terminal
import { useEditorStore } from './store/editorStore';

function App() {
  const { showTerminal, toggleTerminal } = useEditorStore(); // Get terminal state and toggle function

  return (
    <div className="flex h-screen bg-gray-900">
      <FileExplorer />
      <div className="flex flex-col flex-1">
        <Toolbar />
        <Editor />
        {showTerminal && ( // Conditionally render the terminal as a pop-up window
          <TerminalComponent onClose={toggleTerminal} />
        )}
      </div>
    </div>
  );
}

export default App;