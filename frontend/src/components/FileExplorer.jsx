import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Menu,
  Paper,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import { Delete, Code, Description } from '@mui/icons-material'; // Added icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FileExplorer({ selectedProject, files, setFiles, backendUrl }) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('cpp');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFileClick = (file) => {
    navigate(`/ide/${selectedProject.projectId}/${file.fileName}`);
  };

  const createFile = async () => {
    const fullFileName = `${fileName}.${fileType}`;
    if (files.find((file) => file.fileName === fullFileName)) {
      alert('File already exists!');
      return;
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

  const deleteFile = async (file) => {
    try {
      await axios.delete(`${backendUrl}/api/files/${selectedProject.projectId}/${file.fileName}`);
      setFiles(files.filter((f) => f.fileName !== file.fileName));
    } catch (error) {
      console.error(error);
      alert('Failed to delete file');
    }
  };

  // Helper function to get file type icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'cpp':
        return <Code sx={{ color: '#007ACC' }} />;
      case 'java':
        return <Code sx={{ color: '#B07219' }} />;
      case 'py':
        return <Code sx={{ color: '#3776AB' }} />;
      case 'js':
        return <Code sx={{ color: '#F7DF1E' }} />;
      default:
        return <Description />;
    }
  };

  return (
    <Box sx={{ p: 3,maxWidth: 500 }}>
      {/* Create File Button */}
      
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant="contained"
        startIcon={<Code />}
        sx={{
          backgroundColor: '#E0FF66',
          color: 'black',
          '&:hover': { backgroundColor: '#CDF823' },
        }}
      >
        Create File
      </Button>

      {/* Create File Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.1)', // Glass effect
            backdropFilter: 'blur(20px)',
            borderRadius: '10px',
            marginTop: '10px',
            padding: '16px',
            minWidth: '400px',
          },
        }}>
        <Box sx={{ p: 4,minWidth: 400,m: 2 }}>
          <TextField
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="py">Python</MenuItem>
            <MenuItem value="js">JavaScript</MenuItem>
          </Select>
          <Button
            onClick={createFile}
            variant="contained"
            fullWidth
            sx={{ backgroundColor: '#E0FF66', color: 'black' }}
          >
            Create
          </Button>
        </Box>
      </Menu>

      {/* File List */}
      <List sx={{ mt: 2 }}>
        {files.map((file) => {
          const extension = file.fileName.split('.').pop(); // Extract file extension
          return (
            <Paper
              key={file.fileName}
              elevation={3}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                mb: 1,
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              }}
            >
              {/* File Name and Icon */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => handleFileClick(file)}
              >
                {getFileIcon(extension)}
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {file.fileName}
                </Typography>
              </Box>

              {/* Delete Button */}
              <Tooltip title="Delete File">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file);
                  }}
                  size="small"
                  sx={{ color: '#E6FF84' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          );
        })}
      </List>
    </Box>
  );
}

export default FileExplorer;