import { Router } from 'express';
import { counselorController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';
import {
  validateCreateGroup,
  validateCreateSession,
  validateAssignTask,
  validateUuidParam
} from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Apply auth middleware to all counselor routes
router.use(authMiddleware);
// Verify role is counselor
router.use(requireRole(['ORIENTADOR']));

router.post('/groups', validateCreateGroup, counselorController.createGroup);
router.get('/groups', counselorController.getGroups);
router.get('/groups/:groupId/students', validateUuidParam('groupId'), counselorController.getStudentsInGroup);
router.get('/students/:studentId/file', validateUuidParam('studentId'), counselorController.getStudentFile);
router.post('/students/:studentId/sessions', validateCreateSession, counselorController.createSession);
router.post('/tasks', validateAssignTask, counselorController.assignTask);

export default router;
