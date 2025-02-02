import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import { Folder, Delete } from '@mui/icons-material';

function Sidebar({ drawerOpen, projects, selectedProject, setSelectedProject, deleteProject }) {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? 240 : 80, // Adjust width based on drawerOpen state
        flexShrink: 0,
        transition: 'width 0.3s', // Smooth transition
        '& .MuiDrawer-paper': {
          width: drawerOpen ? 240 : 80, // Adjust width based on drawerOpen state
          boxSizing: 'border-box',
          marginTop: '64px', // Account for the AppBar height
          transition: 'width 0.3s', // Smooth transition
          overflowX: 'hidden', // Hide overflow when collapsed
        },
      }}
    >
      <List>
        {projects.map((project) => (
          <ListItem
            key={project.projectId}
            button
            onClick={() => setSelectedProject(project)}
            selected={selectedProject?.projectId === project.projectId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              whiteSpace: 'nowrap', // Prevent text wrapping
              padding: '8px 16px', // Adjust padding for better spacing
              borderRadius: '8px', // Rounded corners for a modern look
              margin: '4px 8px', // Add spacing between items
              backgroundColor: selectedProject?.projectId === project.projectId ? '#f0f0f0' : 'transparent', // Highlight selected project
              transition: 'background-color 0.2s, transform 0.2s', // Smooth transitions
              '&:hover': {
                backgroundColor: '#e0e0e0', // Light gray on hover
                transform: 'scale(1.02)', // Slight scaling effect
              },
            }}
          >
            {/* Folder Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Folder sx={{ color: '#FFA726', marginRight: 1 }} /> {/* Orange folder icon */}
              {drawerOpen && ( // Only show text if the sidebar is expanded
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: selectedProject?.projectId === project.projectId ? 'bold' : 'normal',
                        color: selectedProject?.projectId === project.projectId ? '#000' : '#333',
                      }}
                    >
                      {project.projectName}
                    </Typography>
                  }
                />
              )}
            </Box>

            {/* Delete Button */}
            {drawerOpen && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.projectId);
                }}
                size="small"
                sx={{ color: 'red' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}

            {/* Tooltip for Collapsed State */}
            {!drawerOpen && (
              <Tooltip title={project.projectName} placement="right">
                <Folder sx={{ color: '#FFA726' }} />
              </Tooltip>
            )}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;