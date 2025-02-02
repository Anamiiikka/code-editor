const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Project = require('../models/Project');
const s3Utils = require('../utils/s3Utils');

exports.createProject = async (req, res) => {
  const { projectName, auth0Id, email } = req.body;
  if (!projectName || !auth0Id || !email) {
    return res.status(400).json({ error: 'Project name, user ID, and email are required!' });
  }
  try {
    let user = await User.findOne({ auth0Id });
    if (!user) {
      user = new User({ auth0Id, email });
      await user.save();
    }

    const projectId = uuidv4();
    const project = new Project({ projectId, projectName, userId: user._id });
    await project.save();

    user.projects.push(project._id);
    await user.save();

    res.status(201).json({ projectId, projectName, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

exports.listProjects = async (req, res) => {
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
};

exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    const user = await User.findById(project.userId);
    if (user) {
      user.projects = user.projects.filter((p) => p.toString() !== project._id.toString());
      await user.save();
    }

    await Project.deleteOne({ projectId });

    await s3Utils.deleteProjectFiles(projectId);

    res.status(200).json({ message: 'Project deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};