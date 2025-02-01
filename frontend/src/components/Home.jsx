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

  // Fetch all projects for the authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      axios.get('http://localhost:5000/api/projects', {
        params: { auth0Id: user.sub }
      }).then((response) => {
        setProjects(response.data);
      });
    }
  }, [isAuthenticated, user]);

  // Fetch files for the selected project
  const fetchFiles = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/${projectId}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  // Update files when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      fetchFiles(selectedProject.projectId);
    }
  }, [selectedProject]);

  // Create a new project
  const createProject = async () => {
    if (!isAuthenticated || !user) {
      alert('You must be logged in to create a project.');
      return;
    }

    const response = await axios.post('http://localhost:5000/api/projects', {
      projectName,
      auth0Id: user.sub, // Pass Auth0 user ID
      email: user.email, // Pass Auth0 email
    });
    setProjects([...projects, response.data]);
    setProjectName('');
    setCreateProjectDialogOpen(false);
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
    setProjects(projects.filter((project) => project.projectId !== projectId));
    setSelectedProject(null);
  };

  // Create a new file in the selected project
  const createFile = async () => {
    const fullFileName = `${fileName}.${fileType}`;
    await axios.post('http://localhost:5000/api/files', {
      projectId: selectedProject.projectId,
      fileName: fullFileName,
      content: ''
    });
    setFiles([...files, fullFileName]);
    setFileName('');
    setAnchorEl(null);
  };

  // Delete a file
  const deleteFile = async (file) => {
    await axios.delete(`http://localhost:5000/api/files/${selectedProject.projectId}/${file}`);
    setFiles(files.filter((f) => f !== file));
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
                button
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
                <Grid item key={file} xs={12} sm={6} md={4}>
                  <Paper
                    elevation={3}
                    style={{ padding: '16px', cursor: 'pointer' }}
                    onClick={() => navigate(`/ide/${selectedProject.projectId}/${file}`)}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Code />
                      <Typography>{file}</Typography>
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