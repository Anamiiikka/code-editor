import React from 'react';
import { Button, TextField, Box, Tooltip } from '@mui/material';
import { Save, PlayArrow, AutoFixHigh, Description, Code } from '@mui/icons-material';
import { styled } from '@mui/system';


const ActionsContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '60px',
  backgroundColor: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
  zIndex: 1000,

  [`@media (max-width: 600px)`]: {
    flexDirection: 'column',
    height: 'auto',
    padding: '8px 16px',
    gap: '8px',
  },
}));


const LeftContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  [`@media (max-width: 600px)`]: {
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    alignItems: 'center',
  },
});

const RightContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [`@media (max-width: 600px)`]: {
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    alignItems: 'center',
  },
});

// 🔹 Styled Buttons
const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: '10px 16px',
  fontWeight: 500,
  fontSize: '14px',
  borderRadius: '6px',
  color: '#FFFFFF',
  backgroundColor: '#BBE613',
  '&:hover': {
    backgroundColor: '#D4FF2A',
  },
  '&.Mui-disabled': {
    backgroundColor: '#444',
    color: '#888',
  },
}));

// 🔹 Input Field for AI Snippet
const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '250px',
  '& .MuiOutlinedInput-root': {
    height: '40px',
    '& fieldset': {
      borderColor: '#444',
    },
    '&:hover fieldset': {
      borderColor: '#007ACC',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007ACC',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
    color: '#d4d4d4',
  },
  '& .MuiInputLabel-root': {
    color: '#aaa',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#007ACC',
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
      
      <LeftContainer>
        <Tooltip title="Save your file">
          <ActionButton onClick={saveFile} variant="contained" startIcon={<Save />}>
            Save File
          </ActionButton>
        </Tooltip>

        <Tooltip title="Run your code">
          <ActionButton
            onClick={runCode}
            variant="contained"
            disabled={isRunning}
            startIcon={<PlayArrow />}
            sx={{
              backgroundColor: isRunning ? '#555' : '#28A745',
              '&:hover': {
                backgroundColor: isRunning ? '#444' : '#218838',
              },
            }}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </ActionButton>
        </Tooltip>
      </LeftContainer>

      
      <RightContainer>
        <Tooltip title="Fetch AI linting fixes">
          <ActionButton onClick={fetchAiFixes} variant="outlined" startIcon={<AutoFixHigh />}>
            AI Lint
          </ActionButton>
        </Tooltip>

        <Tooltip title="Generate AI documentation">
          <ActionButton onClick={generateAiDocs} variant="outlined" startIcon={<Description />}>
            Generate Docs
          </ActionButton>
        </Tooltip>

        {/* Snippet Input Field */}
        <StyledTextField
          label="Snippet Description"
          onChange={(e) => setSnippetDescription(e.target.value)}
          margin="normal"
          placeholder="Describe snippet..."
        />

        <Tooltip title="Generate AI code snippet">
          <ActionButton onClick={generateAiSnippet} variant="outlined" startIcon={<Code />}>
            Generate Snippet
          </ActionButton>
        </Tooltip>
      </RightContainer>
    </ActionsContainer>
  );
}

export default FileActions;
