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
import { Button, TextField, Typography, Box, Paper, Select, MenuItem, FormControl, InputLabel, Drawer, IconButton } from '@mui/material';
import { Save, PlayArrow, Close } from '@mui/icons-material';
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
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiFixes, setAiFixes] = useState('');
  const [aiDocs, setAiDocs] = useState('');
  const [aiSnippet, setAiSnippet] = useState('');
  const [snippetDescription, setSnippetDescription] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Fetch AI Auto-Completion Suggestions
  const fetchAutoCompleteSuggestions = async (code) => {
    try {
      const response = await axios.post(`${backendUrl}/api/ai/auto-complete`, { code });
      setAiSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  };

  // Fetch AI Linting Fixes
  const fetchAiFixes = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/ai/lint`, { code });
      setAiFixes(response.data.fixes);
      setIsSidebarOpen(true); // Open sidebar when AI fixes are available
    } catch (error) {
      console.error('Error fetching AI fixes:', error);
    }
  };

  // Generate AI Documentation
  const generateAiDocs = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/ai/generate-docs`, { code });
      setAiDocs(response.data.docs);
      setIsSidebarOpen(true); // Open sidebar when AI docs are available
    } catch (error) {
      console.error('Error generating AI docs:', error);
    }
  };

  // Generate AI Code Snippet
  const generateAiSnippet = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/ai/generate-snippet`, {
        description: snippetDescription,
      });
      setAiSnippet(response.data.snippet); // Store snippet in state (not in editor)
      setIsSidebarOpen(true); // Open sidebar when AI snippet is generated
    } catch (error) {
      console.error('Error generating AI snippet:', error);
    }
  };

  // Handle theme change
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
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
          extensions={[language, aiAutocompletion].filter(Boolean)}
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
          <Button onClick={fetchAiFixes}>AI Lint</Button>
          <Button onClick={generateAiDocs}>Generate Docs</Button>
          <TextField
            label="Describe the code snippet you need"
            variant="outlined"
            multiline
            rows={2}
            value={snippetDescription}
            onChange={(e) => setSnippetDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button onClick={generateAiSnippet}>Generate Snippet</Button>
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
          onChange={(e) => setInput(e.target.value)}
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

      {/* AI Sidebar */}
      <Drawer
        anchor="right"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{ width: '30%', flexShrink: 0 }}
      >
        <Box sx={{ width: '100%', padding: 2 }}>
          <IconButton onClick={() => setIsSidebarOpen(false)} sx={{ marginBottom: 2 }}>
            <Close />
          </IconButton>
          {aiFixes && (
            <>
              <Typography variant="h6" gutterBottom>
                AI Linting Fixes
              </Typography>
              <Paper elevation={3} className="ai-output-paper">
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {aiFixes}
                </Typography>
              </Paper>
            </>
          )}
          {aiDocs && (
            <>
              <Typography variant="h6" gutterBottom>
                AI Documentation
              </Typography>
              <Paper elevation={3} className="ai-output-paper">
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {aiDocs}
                </Typography>
              </Paper>
            </>
          )}
          {aiSnippet && (
            <>
              <Typography variant="h6" gutterBottom>
                AI Generated Snippet
              </Typography>
              <Paper elevation={3} className="ai-output-paper">
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {aiSnippet}
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

export default IDE;