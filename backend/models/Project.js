const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user
  files: [{ fileName: String, content: String }], // Array of files
});

module.exports = mongoose.model('Project', projectSchema);