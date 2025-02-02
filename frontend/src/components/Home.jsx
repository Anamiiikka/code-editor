import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, TextField, Container, Typography, Box, Grid, Paper, List, ListItem, ListItemText,
  IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Drawer, Toolbar, AppBar, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
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
  
  const[open,setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
const[drawerWidth,setDrawerWidth] = useState(240);
 
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
            onClick={() => setDrawerOpen(drawerWidth === 240?80:240)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, 
            fontFamily: 'sans-serif',
          }}>
            CODEV
          </Typography>

          {/* Auth0 Login/Logout Buttons */}
          {!isAuthenticated && (
            <Button 
            variant='outlined'
            color="inherit" 
            onClick={() => loginWithRedirect()}
            sx={{
              backgroundColor: '#BBE613', 
                color: 'black', 
                borderRadius: '6px',
                padding: '5px 15px',
                transition: '0.3s', 
                '&:hover': {
                  backgroundColor: '#D4FF2A', 
                },
              }}>
              Log In
            </Button>
          )}
          {isAuthenticated && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.name}!
              </Typography>
              <Button 
              variant='outlined'
              color="inherit" 
              onClick={() => logout()}
              sx={{
                backgroundColor: '#BBE613', 
                color: 'black', 
                borderRadius: '6px',
                padding: '5px 15px',
                transition: '0.3s', 
                '&:hover': {
                  backgroundColor: '#D4FF2A', 
                },
               }}>
                Log Out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={ "permanent"}
        sx={{
          width: drawerWidth, 
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth, 
            boxSizing: "border-box",
            transition: "width 0.3s ease-in-out", 
          },
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
                color = "inherit"
                startIcon={<Add />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                   backgroundColor: '#BBE613',
                   color: 'black',
                 }}
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
                  <Button variant="contained" color="primary" onClick={createFile}
                  sx={{
                    backgroundColor: '#BBE613',
                  }}>
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
        sx={{ position: 'fixed', bottom: 16, right: 16, 
          backgroundColor: '#BBE613',
        }}
        onClick={() => setCreateProjectDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialog for Creating Projects */}
      <Dialog
        open={createProjectDialogOpen}
        onClose={() => setCreateProjectDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '400px',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0px 4px 10px rgba(32, 32, 32, 0.1)',
            margin: 'auto',
        },
        }}
      >
        <DialogTitle
         sx={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'white', 
          paddingBottom: '16px',
          fontFamily: 'sans-serif',
        }}>
          Create New Project
          </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
              '& .MuiInputLabel-root': {
                color: '#5f6368', // Softer label color
              },
            }}
          />
        </DialogContent>
        <DialogActions
         sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '12px',
        }}>
           <Button
      onClick={() => setCreateProjectDialogOpen(false)}
      variant="outlined"
      color="secondary"
      sx={{
        padding: '6px 16px',
        fontWeight: '500',
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: '#f1f1f1',
        },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={createProject}
      variant="contained"
      color="primary"
      sx={{
        padding: '6px 16px',
        fontWeight: '500',
        borderRadius: '8px',
        marginLeft: '8px',
        backgroundColor: '#BBE613',
        '&:hover': {
          backgroundColor: '#D4FF2A',
        },
      }}>Create
      </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;