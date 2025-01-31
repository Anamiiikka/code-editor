import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';

export const Editor = () => {
  const { code, language, theme, fontSize, setCode } = useEditorStore();

  const handleEditorChange = (value = '') => {
    setCode(value);
  };

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={language}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
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