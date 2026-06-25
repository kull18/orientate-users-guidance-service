import { Router } from 'express';
import { studentController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';
import {
  validateCreateStudentProfile,
  validateUpdateStudentProfile,
  validateJoinGroup
} from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Apply auth middleware to all student routes
router.use(authMiddleware);
// Verify role is student
router.use(requireRole(['ESTUDIANTE']));

router.post('/profile', validateCreateStudentProfile, studentController.createProfile);
router.get('/profile', studentController.getProfile);
router.patch('/profile', validateUpdateStudentProfile, studentController.updateProfile);
router.post('/join-group', validateJoinGroup, studentController.joinGroup);

export default router;
