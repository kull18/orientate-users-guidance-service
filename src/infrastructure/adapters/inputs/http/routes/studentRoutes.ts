import { Router } from 'express';
import { studentController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all student routes
router.use(authMiddleware);
// Verify role is student
router.use(requireRole(['ESTUDIANTE']));

router.post('/profile', studentController.createProfile);
router.get('/profile', studentController.getProfile);
router.patch('/profile', studentController.updateProfile);
router.post('/join-group', studentController.joinGroup);

export default router;
