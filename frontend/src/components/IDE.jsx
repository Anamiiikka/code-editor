import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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
import { Button, TextField, Typography, Box, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Save, PlayArrow } from '@mui/icons-material';
import './IDE.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
  md: html(), // Markdown can use HTML highlighting
  txt: null, // Plaintext (no syntax highlighting)
};

// Editor Themes
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'oneDark', label: 'One Dark' },
];

function IDE() {
  const { projectId, fileName } = useParams();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('oneDark'); // Default theme
  const editorRef = useRef(null);

  const fileExtension = fileName.split('.').pop();
  const language = languageMap[fileExtension] || null;

  // Fetch file content when the component mounts
  useEffect(() => {
    axios.get(`${backendUrl}/api/files/${projectId}/${fileName}`)
      .then((response) => setCode(response.data.content))
      .catch((error) => console.error('Error fetching file:', error));
  }, [projectId, fileName]);

  // Save file content
  const saveFile = async () => {
    try {
      await axios.post(`${backendUrl}/api/files`, { projectId, fileName, content: code });
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    try {
      await saveFile(); // Save before running
      const response = await axios.post(`${backendUrl}/api/run`, { projectId, fileName, input });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle theme change
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <Box className="ide-container">
      {/* Code Editor */}
      <Box className="editor-container">
        <Box className="editor-toolbar">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Theme</InputLabel>
            <Select value={theme} onChange={handleThemeChange} label="Theme">
              {themes.map((theme) => (
                <MenuItem key={theme.value} value={theme.value}>
                  {theme.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <CodeMirror
          ref={editorRef}
          value={code}
          height="calc(100vh - 220px)"
          extensions={[language, autocompletion()].filter(Boolean)} 
          theme={theme === 'oneDark' ? oneDark : theme}
          onChange={(value) => setCode(value)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            syntaxHighlighting: true,
          }}
        />
        <Box className="button-container">
          <Button variant="contained" color="primary" startIcon={<Save />} onClick={saveFile}>
            Save File
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrow />}
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </Box>
      </Box>

      {/* Output and Input Area */}
      <Box className="output-container">
        <Typography variant="h6" gutterBottom>
          Input
        </Typography>
        <TextField
          label="Enter input (if required)"
          variant="outlined"
          multiline
          rows={4}
          value={input}
          onChange={(e) => {
            console.log("User Input:", e.target.value); // Debugging line
            setInput(e.target.value);
          }}
          fullWidth
          margin="normal"
        />
        <Typography variant="h6" gutterBottom>
          Output
        </Typography>
        <Paper elevation={3} className="output-paper">
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {output}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default IDE;