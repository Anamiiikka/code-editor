const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');

router.post('/', executionController.runCode);

module.exports = router;