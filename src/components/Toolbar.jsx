import React from 'react';
import { useEditorStore } from '../store/editorStore';
import {
  Code2,
  Sun,
  Moon,
  Type,
  Braces,
  FileJson,
  Terminal as TerminalIcon,
  FolderOpen,
} from 'lucide-react';

export const Toolbar = () => {
  const {
    language,
    theme,
    fontSize,
    setLanguage,
    setTheme,
    setFontSize,
    openFolder,
    showTerminal,
    toggleTerminal, // Add this function to the store
  } = useEditorStore();

  const languages = ['javascript', 'typescript', 'python', 'html'];

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-800 text-white">
      <div className="flex items-center gap-2">
        <Code2 size={20} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 rounded px-2 py-1"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
        className="p-1 rounded hover:bg-gray-700"
      >
        {theme === 'vs-dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="flex items-center gap-2">
        <Type size={20} />
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-16 bg-gray-700 rounded px-2 py-1"
          min={8}
          max={32}
        />
      </div>

      <button
        className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700"
        onClick={openFolder}
      >
        <FolderOpen size={16} />
        Open Folder
      </button>

      <div className="flex gap-2">
        <button className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">
          <Braces size={16} />
          Format
        </button>
        <button className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700">
          <TerminalIcon size={16} />
          Run
        </button>
        <button className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700">
          <FileJson size={16} />
          AI Assist
        </button>
      </div>

      {/* Add Terminal Toggle Button */}
      <button
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        onClick={toggleTerminal}
      >
        <TerminalIcon size={16} />
        {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
      </button>
    </div>
  );
};