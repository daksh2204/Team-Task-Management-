import express from 'express';
import { createProject, getProjects, addMember, removeMember } from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, adminOnly, createProject).get(protect, getProjects);
router.route('/:id/add-member').put(protect, adminOnly, addMember);
router.route('/:id/remove-member').delete(protect, adminOnly, removeMember);

export default router;
