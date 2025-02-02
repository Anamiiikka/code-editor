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


const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const app = express();
const PORT = 5000;

const Groq = require('groq-sdk');

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
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

// Initialize Groq
const groq = new Groq();  

// AI Auto-Completion Endpoint
app.post('/api/ai/auto-complete', async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Suggest code completions for:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 50,
    });
    res.json({ suggestions: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// AI Linting Endpoint
app.post('/api/ai/lint', async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Analyze this code for syntax errors and suggest fixes:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 100,
    });
    res.json({ fixes: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error linting code:', error);
    res.status(500).json({ error: 'Failed to lint code' });
  }
});

// AI Documentation Generation Endpoint
app.post('/api/ai/generate-docs', async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Generate documentation for this code:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300,
    });
    res.json({ docs: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating docs:', error);
    res.status(500).json({ error: 'Failed to generate docs' });
  }
});

// AI Code Snippet Generation Endpoint
app.post('/api/ai/generate-snippet', async (req, res) => {
  const { description } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Generate a code snippet for: ${description}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 200,
    });
    res.json({ snippet: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating snippet:', error);
    res.status(500).json({ error: 'Failed to generate snippet' });
  }
});

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

const axios = require('axios');

app.post('/api/run', async (req, res) => {
  const { projectId, fileName, input } = req.body;

  try {
    // Fetch the file content from S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
    };
    const data = await s3.getObject(params).promise();
    const fileContent = data.Body.toString('utf-8');

    // Determine the language based on the file extension
    const extension = path.extname(fileName);
    let language;
    switch (extension) {
      case '.cpp':
        language = 'cpp17'; // C++17
        break;
      case '.java':
        language = 'java'; // Java
        break;
      case '.py':
        language = 'python3'; // Python 3
        break;
      case '.js':
        language = 'nodejs'; // JavaScript (Node.js)
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type!' });
    }

    // Prepare the request payload for JDoodle
    const jdoodlePayload = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: fileContent,
      language: language,
      stdin: input || '',
      versionIndex: '0', // Use the latest version of the language
    };

    // Make a POST request to JDoodle API
    const jdoodleResponse = await axios.post('https://api.jdoodle.com/v1/execute', jdoodlePayload);

    // Extract the response data
    const { output, statusCode, error } = jdoodleResponse.data;

    if (statusCode === 200) {
      // Success: Return the output
      res.status(200).json({ output });
    } else {
      // Error: Return the error message
      res.status(500).json({ error: error || 'Failed to execute code' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});