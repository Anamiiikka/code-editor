const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://codedpool10:fHgJNh67CGV3qokG@cluster0.d0sfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Models
const User = require('./models/User');
const Project = require('./models/Project');

// Ensure projects directory exists
const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// Helper function to read project metadata
const readProjectMetadata = (projectId) => {
  const metadataPath = path.join(projectsDir, projectId, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  }
  return null;
};

// API to create a new project
app.post('/api/projects', async (req, res) => {
    const { projectName, auth0Id, email } = req.body; // Add email to the request body
  
    if (!projectName || !auth0Id || !email) {
      return res.status(400).json({ error: 'Project name, user ID, and email are required!' });
    }
  
    try {
      // Find or create the user
      let user = await User.findOne({ auth0Id });
      if (!user) {
        user = new User({ auth0Id, email }); // Use the email from Auth0
        await user.save();
      }
  
      // Create the project
      const projectId = uuidv4();
      const projectPath = path.join(projectsDir, projectId);
      fs.mkdirSync(projectPath);
  
      const metadata = { projectId, projectName, userId: user._id };
      fs.writeFileSync(path.join(projectPath, 'metadata.json'), JSON.stringify(metadata));
  
      const project = new Project({ projectId, projectName, userId: user._id });
      await project.save();
  
      // Add the project to the user's projects array
      user.projects.push(project._id);
      await user.save();
  
      res.status(201).json(metadata);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

// API to list all projects for a user
app.get('/api/projects', async (req, res) => {
  const { auth0Id } = req.query;

  if (!auth0Id) {
    return res.status(400).json({ error: 'User ID is required!' });
  }

  try {
    const user = await User.findOne({ auth0Id }).populate('projects');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// API to delete a project
app.delete('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    // Remove the project from the user's projects array
    const user = await User.findById(project.userId);
    if (user) {
      user.projects = user.projects.filter((p) => p.toString() !== project._id.toString());
      await user.save();
    }

    // Delete the project from the database
    await Project.deleteOne({ projectId });

    // Delete the project directory
    const projectPath = path.join(projectsDir, projectId);
    if (fs.existsSync(projectPath)) {
      fs.rmdirSync(projectPath, { recursive: true });
    }

    res.status(200).json({ message: 'Project deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// API to create a new file
app.post('/api/files', async (req, res) => {
  const { projectId, fileName, content } = req.body;

  if (!projectId || !fileName) {
    return res.status(400).json({ error: 'Project ID and file name are required!' });
  }

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    const filePath = path.join(projectsDir, projectId, fileName);
    fs.writeFileSync(filePath, content || '');

    // Add the file to the project's files array
    project.files.push({ fileName, content });
    await project.save();

    res.status(201).json({ message: 'File created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// API to get file content
app.get('/api/files/:projectId/:fileName', (req, res) => {
  const { projectId, fileName } = req.params;
  const filePath = path.join(projectsDir, projectId, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found!' });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  res.status(200).json({ content });
});

// API to delete a file
app.delete('/api/files/:projectId/:fileName', async (req, res) => {
  const { projectId, fileName } = req.params;

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    const filePath = path.join(projectsDir, projectId, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found!' });
    }

    fs.unlinkSync(filePath);

    // Remove the file from the project's files array
    project.files = project.files.filter((file) => file.fileName !== fileName);
    await project.save();

    res.status(200).json({ message: 'File deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});