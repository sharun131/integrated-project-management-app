const express = require('express');
const { uploadDocument, getProjectDocuments, downloadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload'); // reusing existing multer config

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadDocument);
router.get('/project/:projectId', getProjectDocuments);
router.get('/download/:id', downloadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
