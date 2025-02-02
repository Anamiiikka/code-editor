import React from 'react';
import {
  Button,
  TextField,
  Box,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
import { Save, PlayArrow, AutoFixHigh, Description, Code } from '@mui/icons-material';
import { styled } from '@mui/system';

// Styled Components for Enhanced UI
const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  backgroundColor: '#252526', // Darker background for the container
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 500,
  fontSize: '14px',
  borderRadius: '8px',
  color: '#d4d4d4', // Light text color
  backgroundColor: '#007ACC', // Accent color for primary buttons
  '&:hover': {
    backgroundColor: '#006C9D', // Slightly darker on hover
  },
  '&.Mui-disabled': {
    backgroundColor: '#333', // Disabled state
    color: '#666',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#444', // Border color for input fields
    },
    '&:hover fieldset': {
      borderColor: '#007ACC', // Highlight on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007ACC', // Highlight when focused
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
    color: '#d4d4d4', // Light text color for input
  },
  '& .MuiInputLabel-root': {
    color: '#aaa', // Label color
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#007ACC', // Label color when focused
  },
}));

function FileActions({
  saveFile,
  runCode,
  fetchAiFixes,
  generateAiDocs,
  generateAiSnippet,
  setSnippetDescription,
  isRunning,
}) {
  return (
    <ActionsContainer>
      {/* Save File Button */}
      <Tooltip title="Save your file">
        <ActionButton
          onClick={saveFile}
          variant="contained"
          startIcon={<Save />}
        >
          Save File
        </ActionButton>
      </Tooltip>

      {/* Run Code Button */}
      <Tooltip title="Run your code">
        <ActionButton
          onClick={runCode}
          variant="contained"
          disabled={isRunning}
          startIcon={<PlayArrow />}
          sx={{
            backgroundColor: isRunning ? '#555' : '#28A745', // Green for success
            '&:hover': {
              backgroundColor: isRunning ? '#444' : '#218838',
            },
          }}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </ActionButton>
      </Tooltip>

      {/* AI Lint Button */}
      <Tooltip title="Fetch AI linting fixes">
        <ActionButton
          onClick={fetchAiFixes}
          variant="outlined"
          startIcon={<AutoFixHigh />}
          sx={{
            borderColor: '#007ACC',
            color: '#d4d4d4', // Light text color
            '&:hover': {
              borderColor: '#006C9D',
              backgroundColor: '#333', // Dark hover effect
            },
          }}
        >
          AI Lint
        </ActionButton>
      </Tooltip>

      {/* Generate Docs Button */}
      <Tooltip title="Generate AI documentation">
        <ActionButton
          onClick={generateAiDocs}
          variant="outlined"
          startIcon={<Description />}
          sx={{
            borderColor: '#007ACC',
            color: '#d4d4d4', // Light text color
            '&:hover': {
              borderColor: '#006C9D',
              backgroundColor: '#333', // Dark hover effect
            },
          }}
        >
          Generate Docs
        </ActionButton>
      </Tooltip>

      {/* Snippet Description Input */}
      <StyledTextField
        label="Snippet Description"
        onChange={(e) => setSnippetDescription(e.target.value)}
        fullWidth
        margin="normal"
        placeholder="Describe the snippet you want to generate..."
      />

      {/* Generate Snippet Button */}
      <Tooltip title="Generate AI code snippet">
        <ActionButton
          onClick={generateAiSnippet}
          variant="outlined"
          startIcon={<Code />}
          sx={{
            borderColor: '#007ACC',
            color: '#d4d4d4', // Light text color
            '&:hover': {
              borderColor: '#006C9D',
              backgroundColor: '#333', // Dark hover effect
            },
          }}
        >
          Generate Snippet
        </ActionButton>
      </Tooltip>
    </ActionsContainer>
  );
}

export default FileActions;