import React from 'react';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

function FloatingActionButton({ onClick }) {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        backgroundColor: '#BBE613', // Consistent with FileExplorer theme
        color: 'black', // Black icon for contrast
        '&:hover': {
          backgroundColor: '#A8D800', // Slightly darker on hover
          transform: 'scale(1.1)', // Slight scaling effect
          transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        },
        '&:active': {
          transform: 'scale(0.95)', // Slight shrinking effect on click
          transition: 'transform 0.1s ease-in-out',
        },
      }}
    >
      <Add />
    </Fab>
  );
}

export default FloatingActionButton;