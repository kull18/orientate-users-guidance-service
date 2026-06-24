import { Router } from 'express';
import { counselorController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all counselor routes
router.use(authMiddleware);
// Verify role is counselor
router.use(requireRole(['ORIENTADOR']));

router.post('/groups', counselorController.createGroup);
router.get('/groups', counselorController.getGroups);
router.get('/groups/:groupId/students', counselorController.getStudentsInGroup);
router.get('/students/:studentId/file', counselorController.getStudentFile);
router.post('/students/:studentId/sessions', counselorController.createSession);
router.post('/tasks', counselorController.assignTask);

export default router;
