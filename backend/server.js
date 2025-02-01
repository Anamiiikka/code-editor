const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-ide';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Mongoose Models
const User = require('./models/User');
const Project = require('./models/Project');

// Ensure projects directory exists
const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// API to create a new project
app.post('/api/projects', async (req, res) => {
  const { projectName, auth0Id, email } = req.body;

  if (!projectName || !auth0Id || !email) {
    return res.status(400).json({ error: 'Project name, user ID, and email are required!' });
  }

  try {
    // Find or create the user
    let user = await User.findOne({ auth0Id });
    if (!user) {
      user = new User({ auth0Id, email });
      await user.save();
    }

    // Create the project
    const projectId = uuidv4();
    const project = new Project({ projectId, projectName, userId: user._id });
    await project.save();

    // Add the project to the user's projects array
    user.projects.push(project._id);
    await user.save();

    // Return the project metadata
    res.status(201).json({ projectId, projectName, userId: user._id });
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

    // Delete all files in the project from S3
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `${projectId}/`,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length > 0) {
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
      };
      await s3.deleteObjects(deleteParams).promise();
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
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
      Body: content || '',
    };

    await s3.upload(params).promise();

    // Update the project's files array in MongoDB
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    project.files.push({ fileName, content });
    await project.save();

    res.status(201).json({ message: 'File created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// API to get file content
app.get('/api/files/:projectId/:fileName', async (req, res) => {
  const { projectId, fileName } = req.params;

  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
    };

    const data = await s3.getObject(params).promise();
    res.status(200).json({ content: data.Body.toString('utf-8') });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'File not found!' });
  }
});

// API to delete a file
app.delete('/api/files/:projectId/:fileName', async (req, res) => {
  const { projectId, fileName } = req.params;

  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
    };

    await s3.deleteObject(params).promise();

    // Remove the file from the project's files array in MongoDB
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    project.files = project.files.filter((file) => file.fileName !== fileName);
    await project.save();

    res.status(200).json({ message: 'File deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.post('/api/run', async (req, res) => {
  const { projectId, fileName, input } = req.body;

  try {
      const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${projectId}/${fileName}`,
      };

      const data = await s3.getObject(params).promise();
      const fileContent = data.Body.toString('utf-8');

      const filePath = path.join(projectsDir, projectId, fileName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileContent);

      const extension = path.extname(fileName);
      let command = '';

      switch (extension) {
          case '.cpp':
              command = `g++ ${filePath} -o ${filePath}.out && ${filePath}.out`;
              break;
          case '.java':
              command = `javac ${filePath} && java -cp ${path.dirname(filePath)} ${path.basename(fileName, '.java')}`;
              break;
          case '.py':
              command = `python3 ${filePath}`;
              break;
          case '.js':
              command = `node ${filePath}`;
              break;
          default:
              return res.status(400).json({ error: 'Unsupported file type!' });
      }

      const child = exec(command, (error, stdout, stderr) => {
          if (error) {
              return res.status(500).json({ error: stderr });
          }
          res.status(200).json({ output: stdout });
      });

      child.stdin.write(input + "\n");
      child.stdin.end();
  } catch (error) {
      console.error(error);
      res.status(404).json({ error: 'File not found!' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});