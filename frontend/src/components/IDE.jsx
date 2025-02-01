import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import { Save, PlayArrow } from '@mui/icons-material';
import './IDE.css';

function IDE() {
  const { projectId, fileName } = useParams();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch file content when the component mounts
  useEffect(() => {
    axios.get(`http://localhost:5000/api/files/${projectId}/${fileName}`).then((response) => {
      setCode(response.data.content);
    });
  }, [projectId, fileName]);

  // Save file content
  const saveFile = async () => {
    await axios.post('http://localhost:5000/api/files', { projectId, fileName, content: code });
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    try {
      // Save the file before running the code
      await saveFile();

      // Execute the code
      const response = await axios.post('http://localhost:5000/api/run', { projectId, fileName, input });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newEditorWidth = e.clientX - containerRect.left;
        const newOutputWidth = containerRect.width - newEditorWidth;

        if (editorRef.current && outputRef.current) {
          editorRef.current.style.width = `${newEditorWidth}px`;
          outputRef.current.style.width = `${newOutputWidth}px`;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Box className="ide-container" ref={containerRef}>
      {/* Code Editor */}
      <Box className="editor-container" ref={editorRef}>
        <Editor
          height="calc(100vh - 180px)" // Adjust height for buttons and padding
          language={fileName.split('.').pop()}
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: false },
            suggest: { showWords: false }, // Improve code suggestions
          }}
        />
        <Box className="button-container">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={saveFile}
          >
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

      {/* Resize Handle */}
      <Box
        className="resize-handle"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Output and Input Area */}
      <Box className="output-container" ref={outputRef}>
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
    </Box>
  );
}

export default IDE;