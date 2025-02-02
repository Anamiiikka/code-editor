import React from 'react';
import {
  TextField,
  Typography,
  Paper,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/system';

// Styled Components for Enhanced UI
const OutputContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  backgroundColor: '#000000',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.grey[400],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
    fontFamily: 'monospace',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '12px',
  backgroundColor: '#1e1e1e', // Dark background for code output
  color: '#d4d4d4', // Light text for contrast
  overflowX: 'auto',
  maxHeight: '200px',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#666',
    borderRadius: '4px',
  },
}));

function OutputArea({ input, setInput, output }) {
  // Function to copy output to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(
      () => {
        console.log('Copied output to clipboard:', output);
      },
      (error) => {
        console.error('Failed to copy output:', error);
      }
    );
  };

  return (
    <OutputContainer>
      {/* Input Section */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '##4ec9b0' }}>
        Input
      </Typography>
      <StyledTextField
        value={input}
        onChange={(e) => setInput(e.target.value)}
        fullWidth
        multiline
        rows={4}
        placeholder="Enter input here..."
        variant="outlined"
      />

      {/* Output Section */}
      <Box mt={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '##4ec9b0' }}>
            Output
          </Typography>
          {output && (
            <Tooltip title="Copy Output">
              <IconButton onClick={copyToClipboard} size="small" sx={{ color: '#4ec9b0' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <StyledPaper elevation={3}>
          <pre style={{ margin: 0, fontSize: '14px', fontFamily: 'monospace' }}>
            {output || 'No output yet...'}
          </pre>
        </StyledPaper>
      </Box>
    </OutputContainer>
  );
}

export default OutputArea;