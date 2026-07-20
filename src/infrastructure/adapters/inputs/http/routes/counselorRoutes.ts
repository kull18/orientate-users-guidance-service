import { Router } from 'express';
import { counselorController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';
import {
  validateCreateGroup,
  validateCreateSession,
  validateAssignTask,
  validateUuidParam,
  validateUpdateGroup
} from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Apply auth middleware to all counselor routes
router.use(authMiddleware);
// Verify role is counselor
router.use(requireRole(['ORIENTADOR']));

router.post('/groups', validateCreateGroup, counselorController.createGroup);
router.get('/groups', counselorController.getGroups);
router.get('/groups/:groupId', validateUuidParam('groupId'), counselorController.getGroupDetails);
router.put('/groups/:groupId', validateUpdateGroup, counselorController.updateGroup);
router.delete('/groups/:groupId', validateUuidParam('groupId'), counselorController.deleteGroup);
router.get('/groups/:groupId/students', validateUuidParam('groupId'), counselorController.getStudentsInGroup);
router.get('/students', counselorController.getStudents);
router.get('/students/:studentId/file', validateUuidParam('studentId'), counselorController.getStudentFile);
router.post('/students/:studentId/sessions', validateCreateSession, counselorController.createSession);
router.post('/tasks', validateAssignTask, counselorController.assignTask);
router.get('/appointments', counselorController.getAppointments);
router.post('/availability', counselorController.setAvailability);
router.get('/availability', counselorController.getAvailability);

// Mock endpoints to prevent HTML 404 errors in Flutter console
router.get('/stats', (req, res) => {
  res.status(200).json({
    totalStudents: 0,
    activeStudents: 0,
    lowProgress: 0,
    highIndecision: 0,
    requests: 0,
    reports: 0
  });
});

router.get('/consultations', (req, res) => {
  res.status(200).json([]);
});

export default router;
