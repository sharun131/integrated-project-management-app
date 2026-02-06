const express = require('express');
const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

// Merge params not needed here yet but good practice
const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getProjects)
    .post(authorize('Super Admin', 'Project Admin', 'Project Manager'), createProject);

router
    .route('/:id')
    .get(getProject)
    .put(authorize('Super Admin', 'Project Admin', 'Project Manager'), updateProject)
    .delete(authorize('Super Admin', 'Project Admin', 'Project Manager'), deleteProject);

module.exports = router;
