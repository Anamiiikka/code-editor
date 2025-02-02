import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

function CreateProjectDialog({ open, setOpen, projectName, setProjectName, createProject }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Create New Project</DialogTitle>
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
        <Button onClick={() => setOpen(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={createProject} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateProjectDialog;