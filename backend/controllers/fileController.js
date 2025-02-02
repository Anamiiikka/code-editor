const AWS = require('aws-sdk');
const path = require('path');
const Project = require('../models/Project');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.createFile = async (req, res) => {
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

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found!' });
    }

    const fileExists = project.files.some((file) => file.fileName === fileName);
    if (!fileExists) {
      project.files.push({ fileName, content });
      await project.save();
    }

    res.status(201).json({ message: 'File created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create file' });
  }
};

exports.getFileContent = async (req, res) => {
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
};

exports.deleteFile = async (req, res) => {
  const { projectId, fileName } = req.params;
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
    };
    await s3.deleteObject(params).promise();

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
};