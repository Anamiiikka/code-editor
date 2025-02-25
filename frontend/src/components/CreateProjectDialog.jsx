import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

function CreateProjectDialog({ open, setOpen, projectName, setProjectName, createProject }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}
    sx={{
      '& .MuiDialog-paper': {
          width: '450px', // Wider box
          padding: '20px',
          borderRadius: '12px', // Rounded corners
          background: 'rgba(255, 255, 255, 0.1)', // Glassmorphism effect
          backdropFilter: 'blur(10px)', // Frosted glass blur
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold',textAlign: 'center'}}>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          fullWidth
          margin="normal"
          
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}  sx={{
            backgroundColor: '#E0FF66',
            color: 'black',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#FF6666',
            },
          }}>
          Cancel
        </Button>
        <Button onClick={createProject} sx={{
            backgroundColor: '#E0FF66',
            color: 'black',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#D4FF2A',
            },
          }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateProjectDialog;