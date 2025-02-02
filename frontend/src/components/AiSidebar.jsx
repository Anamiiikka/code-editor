import React from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/system';

// Styled Components for Enhanced UI (Dark Theme)
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '350px',
  padding: '16px',
  backgroundColor: '#1e1e1e', // Dark background
  color: '#d4d4d4', // Light text for contrast
  height: '100%',
  overflowY: 'auto',
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: '8px',
  color: '#c792ea', // Purple accent for headers
}));

const StyledPre = styled('pre')(({ theme }) => ({
  backgroundColor: '#2d2d2d', // Slightly lighter than the sidebar background
  color: '#d4d4d4', // Light text for code blocks
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  overflowX: 'auto',
  maxHeight: '200px',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#666', // Subtle scrollbar thumb
    borderRadius: '4px',
  },
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  marginLeft: '8px',
  color: '#4ec9b0', // Green accent for copy button
  '&:hover': {
    color: '#3db79a', // Darker green on hover
  },
}));

function AiSidebar({ isSidebarOpen, setIsSidebarOpen, aiFixes, aiDocs, aiSnippet }) {
  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Copied to clipboard:', text);
      },
      (error) => {
        console.error('Failed to copy text:', error);
      }
    );
  };

  return (
    <Drawer
      anchor="right"
      open={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      PaperProps={{
        sx: {
          width: '350px',
          borderLeft: '1px solid #333', // Dark border
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Subtle shadow
          backgroundColor: '#1e1e1e', // Match sidebar background
        },
      }}
    >
      <SidebarContainer>
        {/* Header with Close Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold" color="#d4d4d4">
            AI Assistant
          </Typography>
          <Tooltip title="Close Sidebar">
            <IconButton onClick={() => setIsSidebarOpen(false)} sx={{ color: '#d4d4d4' }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* AI Linting Fixes */}
        {aiFixes && (
          <Box mb={3}>
            <SectionHeader variant="h6">AI Linting Fixes</SectionHeader>
            <StyledPre>{aiFixes}</StyledPre>
            <Tooltip title="Copy to Clipboard">
              <CopyButton onClick={() => copyToClipboard(aiFixes)} size="small">
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </Box>
        )}

        {/* AI Documentation */}
        {aiDocs && (
          <Box mb={3}>
            <Divider sx={{ my: 2, borderColor: '#333' }} />
            <SectionHeader variant="h6">AI Documentation</SectionHeader>
            <StyledPre>{aiDocs}</StyledPre>
            <Tooltip title="Copy to Clipboard">
              <CopyButton onClick={() => copyToClipboard(aiDocs)} size="small">
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </Box>
        )}

        {/* AI Generated Snippet */}
        {aiSnippet && (
          <Box mb={3}>
            <Divider sx={{ my: 2, borderColor: '#333' }} />
            <SectionHeader variant="h6">AI Generated Snippet</SectionHeader>
            <StyledPre>{aiSnippet}</StyledPre>
            <Tooltip title="Copy to Clipboard">
              <CopyButton onClick={() => copyToClipboard(aiSnippet)} size="small">
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </Box>
        )}
      </SidebarContainer>
    </Drawer>
  );
}

export default AiSidebar;