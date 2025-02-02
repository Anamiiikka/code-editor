const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/auto-complete', aiController.autoComplete);
router.post('/lint', aiController.lint);
router.post('/generate-docs', aiController.generateDocs);
router.post('/generate-snippet', aiController.generateSnippet);

module.exports = router;