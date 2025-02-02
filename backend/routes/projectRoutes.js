const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.createProject);
router.get('/', projectController.listProjects);
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;