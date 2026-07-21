import { Router } from 'express';
import { alumniController } from '../../../../../core/config/container';
import { authMiddleware, requireRole } from '../../../../../core/middlewares/authMiddleware';
import {
  validateUpdateAlumniProfile,
  validateShareSuccessStory,
  validateUuidParam
} from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Public routes or shared routes (must allow students and alumni to fetch approved stories)
// Note: We use authMiddleware so req.user is set, but we do NOT restrict by role here
router.get('/alumni/stories', authMiddleware, alumniController.getApprovedSuccessStories);

// Alumni only routes
router.get('/alumni/profile', authMiddleware, requireRole(['ALUMNI']), alumniController.getProfile);
router.put('/alumni/profile', authMiddleware, requireRole(['ALUMNI']), validateUpdateAlumniProfile, alumniController.updateProfile);
router.post('/alumni/stories', authMiddleware, requireRole(['ALUMNI']), validateShareSuccessStory, alumniController.shareSuccessStory);
router.get('/alumni/stories/my', authMiddleware, requireRole(['ALUMNI']), alumniController.getMySuccessStories);

// Admin only moderation routes
router.get('/admin/stories/pending', authMiddleware, requireRole(['ADMIN']), alumniController.getPendingSuccessStories);
router.post('/admin/stories/:storyId/approve', authMiddleware, requireRole(['ADMIN']), validateUuidParam('storyId'), alumniController.approveSuccessStory);
router.post('/admin/stories/:storyId/reject', authMiddleware, requireRole(['ADMIN']), validateUuidParam('storyId'), alumniController.rejectSuccessStory);

// University Management Routes
const universityRoles = ['UNIVERSITY', 'UNIVERSIDAD', 'REPRESENTANTE_UNIVERSIDAD', 'REPRESENTANTE', 'universidad'];

router.get('/university/alumni', authMiddleware, requireRole(universityRoles), alumniController.getUniversityAlumni);
router.post('/university/alumni', authMiddleware, requireRole(universityRoles), alumniController.createUniversityAlumnus);
router.delete('/university/alumni/:alumniId', authMiddleware, requireRole(universityRoles), alumniController.deleteUniversityAlumnus);

router.get('/university/stories/pending', authMiddleware, requireRole(universityRoles), alumniController.getPendingSuccessStories);
router.post('/university/stories/:storyId/approve', authMiddleware, requireRole(universityRoles), validateUuidParam('storyId'), alumniController.approveSuccessStory);
router.post('/university/stories/:storyId/reject', authMiddleware, requireRole(universityRoles), validateUuidParam('storyId'), alumniController.rejectSuccessStory);

router.get('/alumni/university', authMiddleware, requireRole(universityRoles), alumniController.getUniversityAlumni);
router.post('/alumni/university', authMiddleware, requireRole(universityRoles), alumniController.createUniversityAlumnus);
router.delete('/alumni/university/:alumniId', authMiddleware, requireRole(universityRoles), alumniController.deleteUniversityAlumnus);

export default router;
