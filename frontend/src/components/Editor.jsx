import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';

export const Editor = () => {
  const { code, language, theme, fontSize, setCode, openedFile, saveFile } = useEditorStore();

  useEffect(() => {
    if (openedFile) {
      setCode(openedFile.content);
    }
  }, [openedFile, setCode]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 p-2 text-white flex justify-between">
        <span>{openedFile?.name || 'Untitled'}</span>
        <button
          onClick={saveFile}
          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
        >
          Save
        </button>
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height="calc(100vh - 40px)"
        language={language}
        theme={theme}
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          snippetSuggestions: 'inline',
        }}
      />
    </div>
  );
};
