const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/', fileController.createFile);
router.get('/:projectId/:fileName', fileController.getFileContent);
router.delete('/:projectId/:fileName', fileController.deleteFile);

module.exports = router;