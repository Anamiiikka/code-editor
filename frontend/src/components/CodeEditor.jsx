// frontend/src/components/CodeEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { LiveblocksYjsProvider } from '@liveblocks/yjs'; // Import Yjs provider
import { useRoom } from '../liveblocks.config';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

// Language Mapping
const languageMap = {
  js: javascript(),
  ts: javascript(),
  py: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  html: html(),
  css: css(),
  json: json(),
  md: html(),
  txt: null,
};

// Editor Themes
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'oneDark', label: 'One Dark' },
];

function CodeEditor({ code, setCode, fileExtension, backendUrl, projectId, fileName }) {
  const [theme, setTheme] = useState('oneDark');
  const [element, setElement] = useState(null);
  const room = useRoom();

  const ref = useCallback((node) => {
    if (!node) return;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || !room) return;

    // Initialize Yjs document
    const yDoc = new Y.Doc();
    const yText = yDoc.getText('codemirror');
    const undoManager = new Y.UndoManager(yText);

    // Set up Liveblocks Yjs provider
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    yProvider.connect();

    // Fetch initial content from backend
    const fetchInitialContent = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/files/${projectId}/${fileName}`);
        const data = await response.json();
        if (yText.length === 0) { // Only set initial content if empty
          yText.insert(0, data.content);
        }
      } catch (error) {
        console.error('Error fetching initial content:', error);
      }
    };
    fetchInitialContent();

    // Set up CodeMirror
    const state = EditorState.create({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        languageMap[fileExtension] || javascript(),
        yCollab(yText, yProvider.awareness, { undoManager }),
        theme === 'oneDark' ? oneDark : [],
      ],
    });

    const view = new EditorView({
      state,
      parent: element,
    });

    // Sync changes to parent state
    yText.observe(() => {
      const newCode = yText.toString();
      setCode(newCode);
    });

    return () => {
      view.destroy();
      yProvider.destroy(); // Use destroy instead of disconnect
    };
  }, [element, room, fileExtension, theme, backendUrl, projectId, fileName, setCode]);

  return (
    <Box sx={{ padding: '16px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
      <FormControl fullWidth sx={{ marginBottom: '16px' }}>
        <InputLabel id="theme-selector-label">Editor Theme</InputLabel>
        <Select
          labelId="theme-selector-label"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          label="Editor Theme"
        >
          {themes.map((themeOption) => (
            <MenuItem key={themeOption.value} value={themeOption.value}>
              {themeOption.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div ref={ref} style={{ height: '500px', overflow: 'auto' }} />
      <Typography variant="caption" sx={{ marginTop: '8px', color: '#777', display: 'block' }}>
        Tip: Collaborate in real-time with others!
      </Typography>
    </Box>
  );
}

export default CodeEditor;