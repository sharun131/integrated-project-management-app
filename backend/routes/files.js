const express = require('express');
const { uploadFile, getFiles, deleteFile, downloadFile } = require('../controllers/fileUploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(upload.single('file'), uploadFile);

router.route('/task/:taskId')
    .get(getFiles);

router.route('/:id')
    .delete(deleteFile);

router.route('/download/:id')
    .get(downloadFile);

module.exports = router;
