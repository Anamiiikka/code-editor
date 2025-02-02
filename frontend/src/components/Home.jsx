import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import FileExplorer from './FileExplorer';
import CreateProjectDialog from './CreateProjectDialog';
import FloatingActionButton from './FloatingActionButton';
import { useAuth0 } from '@auth0/auth0-react';

function Home() {
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true); // Controls sidebar state
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth0();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated && user) {
      axios.get(`${backendUrl}/api/projects`, { params: { auth0Id: user.sub } }).then((response) => {
        setProjects(response.data);
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedProject) {
      setFiles(selectedProject.files || []);
    }
  }, [selectedProject]);

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

  return (
    <div>
      {/* Header */}
      <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

      {/* Sidebar */}
      <Sidebar
        drawerOpen={drawerOpen}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        deleteProject={deleteProject}
      />

      {/* Main Content */}
      <main style={{ 
        marginLeft: drawerOpen ? 240 : 80, // Adjust margin based on sidebar state
        marginTop: 64, // Account for the AppBar height
        transition: 'margin-left 0.3s', // Add smooth transition
      }}>
        {selectedProject && (
          <FileExplorer
            selectedProject={selectedProject}
            files={files}
            setFiles={setFiles}
            backendUrl={backendUrl}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setCreateProjectDialogOpen(true)} />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createProjectDialogOpen}
        setOpen={setCreateProjectDialogOpen}
        projectName={projectName}
        setProjectName={setProjectName}
        createProject={createProject}
      />
    </div>
  );
}

export default Home;