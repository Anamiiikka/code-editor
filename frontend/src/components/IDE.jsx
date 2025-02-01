import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { Button, TextField, Typography, Box, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Save, PlayArrow } from '@mui/icons-material';
import * as monaco from 'monaco-editor';
import './IDE.css';

// Web Worker Setup for Monaco Editor (Ensures Code Suggestions Work)
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
    if (label === 'css' || label === 'scss' || label === 'less') return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url));
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
    if (label === 'typescript' || label === 'javascript') return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  },
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Language Mapping for Proper Syntax Highlighting
const languageMap = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext',
};

// Editor Themes
const themes = [
  { value: 'vs', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'hc-black', label: 'High Contrast' },
];

function IDE() {
  const { projectId, fileName } = useParams();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('vs-dark'); // Default theme
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const fileExtension = fileName.split('.').pop();
  const language = languageMap[fileExtension] || 'plaintext';

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

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure TypeScript/JavaScript language defaults
    if (language === 'javascript' || language === 'typescript') {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
        allowJs: true,
        checkJs: true,
      });
    }

    // Listen for errors in the editor
    const model = editor.getModel();
    model.onDidChangeContent(() => {
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      console.log('Errors:', markers); // Log errors to the console (optional)
    });
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
        <MonacoEditor
          height="calc(100vh - 220px)"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme}
          options={{
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: true }, // Enable minimap
            wordWrap: 'on',
            lineNumbers: 'on',
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoIndent: 'full',
            suggest: { showWords: true },
            quickSuggestions: true,
            parameterHints: { enabled: true },
            wordBasedSuggestions: true,
            formatOnType: true,
            formatOnPaste: true,
            glyphMargin: true, // Enable glyph margin for error indicators
            lightbulb: { enabled: true }, // Enable lightbulb for code actions
            overviewRulerLanes: 3, // Show errors in the overview ruler
            renderValidationDecorations: 'on', // Show validation decorations
          }}
          onMount={handleEditorDidMount}
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