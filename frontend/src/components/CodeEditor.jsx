import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import axios from 'axios';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';

// Language Mapping for Proper Syntax Highlighting
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

function CodeEditor({ code, setCode, aiSuggestions, setAiSuggestions, fileExtension, backendUrl }) {
  const [theme, setTheme] = useState('oneDark');
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Fetch AI Auto-Completion Suggestions
  const fetchAutoCompleteSuggestions = async (code) => {
    setIsFetchingSuggestions(true);
    try {
      const response = await axios.post(`${backendUrl}/api/ai/auto-complete`, { code });
      setAiSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // AI Auto-Completion Extension
  const aiAutocompletion = autocompletion({
    override: [
      async (context) => {
        const code = context.state.doc.toString();
        await fetchAutoCompleteSuggestions(code);
        return {
          from: context.pos,
          options: aiSuggestions.map((suggestion) => ({ label: suggestion, type: 'text' })),
        };
      },
    ],
  });

  return (
    <Box className="code-editor" sx={{ padding: '16px', backgroundColor: '#000000', borderRadius: '8px' }}>
      {/* Theme Selector */}
      <FormControl fullWidth sx={{ marginBottom: '16px' }}>
        <InputLabel id="theme-selector-label">Editor Theme</InputLabel>
        <Select
          labelId="theme-selector-label"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          label="Editor Theme"
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ccc',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#aaa',
            },
          }}
        >
          {themes.map((themeOption) => (
            <MenuItem key={themeOption.value} value={themeOption.value}>
              {themeOption.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Loading Indicator for AI Suggestions */}
      {isFetchingSuggestions && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <CircularProgress size={20} />
          <Typography variant="caption" sx={{ marginLeft: '8px', color: '#555' }}>
            Fetching AI suggestions...
          </Typography>
        </Box>
      )}

      {/* CodeMirror Editor */}
      <CodeMirror
        value={code}
        height="500px"
        theme={theme === 'oneDark' ? oneDark : theme}
        extensions={[languageMap[fileExtension], aiAutocompletion]}
        onChange={(value) => setCode(value)}
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
          },
        }}
      />

      {/* Tooltip for Theme Options */}
      <Tooltip title="Choose a theme for better readability">
        <Typography variant="caption" sx={{ marginTop: '8px', color: '#777', display: 'block' }}>
          Tip: Select a theme that suits your preference.
        </Typography>
      </Tooltip>
    </Box>
  );
}

export default CodeEditor;