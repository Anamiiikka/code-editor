import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, TextField, Container, Typography, Box, Grid, Paper, List, ListItem, ListItemText,
  IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Drawer, Toolbar, AppBar, Fab, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, Folder, Code, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';

function Home() {
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('cpp');
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all projects for the authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      axios.get(`${backendUrl}/api/projects`, {
        params: { auth0Id: user.sub }
      }).then((response) => {
        setProjects(response.data);
      });
    }
  }, [isAuthenticated, user]);

  // Fetch files for the selected project
  useEffect(() => {
    if (selectedProject) {
      setFiles(selectedProject.files);
    }
  }, [selectedProject]);

  // Create a new project
  const createProject = async () => {
    if (!isAuthenticated || !user) {
      alert('You must be logged in to create a project.');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/projects`, {
        projectName,
        auth0Id: user.sub,
        email: user.email,
      });

      setProjects([...projects, response.data]);
      setProjectName('');
      setCreateProjectDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${backendUrl}/api/projects/${projectId}`);
      setProjects(projects.filter((project) => project.projectId !== projectId));
      setSelectedProject(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete project');
    }
  };

  // Create a new file in the selected project
  const createFile = async () => {
    const fullFileName = `${fileName}.${fileType}`;
  
    // Check if the file already exists
    const existingFile = files.find((file) => file.fileName === fullFileName);
    if (existingFile) {
      alert('File already exists!');
      return; // Stop if file already exists
    }
  
    try {
      await axios.post(`${backendUrl}/api/files`, {
        projectId: selectedProject.projectId,
        fileName: fullFileName,
        content: '',
      });
  
      setFiles([...files, { fileName: fullFileName, content: '' }]);
      setFileName('');
      setAnchorEl(null);
    } catch (error) {
      console.error(error);
      alert('Failed to create file');
    }
  };  

  // Delete a file
  const deleteFile = async (file) => {
    try {
      await axios.delete(`${backendUrl}/api/files/${selectedProject.projectId}/${file.fileName}`);
      setFiles(files.filter((f) => f.fileName !== file.fileName));
    } catch (error) {
      console.error(error);
      alert('Failed to delete file');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Web IDE
          </Typography>

          {/* Auth0 Login/Logout Buttons */}
          {!isAuthenticated && (
            <Button color="inherit" onClick={() => loginWithRedirect()}>
              Log In
            </Button>
          )}
          {isAuthenticated && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.name}!
              </Typography>
              <Button color="inherit" onClick={() => logout()}>
                Log Out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {projects.map((project) => (
              <ListItem
              key={project.projectId}
              
              onClick={() => setSelectedProject(project)}
              selected={selectedProject?.projectId === project.projectId}
            >
              <Folder style={{ marginRight: '8px' }} />
              <ListItemText primary={project.projectName} />
              <IconButton onClick={() => deleteProject(project.projectId)}>
                <Delete />
              </IconButton>
            </ListItem>
            
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {selectedProject && (
          <>
            <Box mb={2} display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Add />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Create File
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <Box p={2}>
                  <TextField
                    label="File Name"
                    variant="outlined"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>File Type</InputLabel>
                    <Select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                    >
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="py">Python</MenuItem>
                      <MenuItem value="js">JavaScript</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" color="primary" onClick={createFile}>
                    Create
                  </Button>
                </Box>
              </Menu>
            </Box>

            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item key={file.fileName} xs={12} sm={6} md={4}>
                  <Paper
                    elevation={3}
                    style={{ padding: '16px', cursor: 'pointer' }}
                    onClick={() => navigate(`/ide/${selectedProject.projectId}/${file.fileName}`)}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Code />
                      <Typography>{file.fileName}</Typography>
                      <IconButton onClick={(e) => { e.stopPropagation(); deleteFile(file); }}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

      {/* Floating Action Button for Creating Projects */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateProjectDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialog for Creating Projects */}
      <Dialog
        open={createProjectDialogOpen}
        onClose={() => setCreateProjectDialogOpen(false)}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProjectDialogOpen(false)}>Cancel</Button>
          <Button onClick={createProject}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;