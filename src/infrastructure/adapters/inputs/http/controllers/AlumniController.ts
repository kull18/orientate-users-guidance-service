import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../../../../../core/middlewares/authMiddleware';
import { AlumniUseCasesPort } from '../../../../../application/ports/inputs/AlumniUseCasesPort';

export class AlumniController {
  constructor(private readonly alumniUseCases: AlumniUseCasesPort) {}

  getProfile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.alumniUseCases.getAlumniProfile(userId);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.alumniUseCases.updateAlumniProfile(userId, req.body);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  shareSuccessStory = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const story = await this.alumniUseCases.shareSuccessStory(userId, req.body);
      res.status(201).json(story);
    } catch (err) {
      next(err);
    }
  };

  getMySuccessStories = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const stories = await this.alumniUseCases.getMySuccessStories(userId);
      res.status(200).json(stories);
    } catch (err) {
      next(err);
    }
  };

  getApprovedSuccessStories = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { careerId } = req.query;
      const stories = await this.alumniUseCases.getApprovedSuccessStories(careerId as string | undefined);
      res.status(200).json(stories);
    } catch (err) {
      next(err);
    }
  };

  getPendingSuccessStories = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stories = await this.alumniUseCases.getPendingSuccessStories();
      res.status(200).json(stories);
    } catch (err) {
      next(err);
    }
  };

  approveSuccessStory = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      await this.alumniUseCases.approveSuccessStory(storyId);
      res.status(200).json({
        status: 'success',
        message: 'Historia de éxito aprobada exitosamente.'
      });
    } catch (err) {
      next(err);
    }
  };

  rejectSuccessStory = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      await this.alumniUseCases.rejectSuccessStory(storyId);
      res.status(200).json({
        status: 'success',
        message: 'Historia de éxito rechazada.'
      });
    } catch (err) {
      next(err);
    }
  };

  getUniversityAlumni = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const universityId = req.user!.id;
      const alumni = await this.alumniUseCases.getUniversityAlumni(universityId);
      res.status(200).json({ status: 'success', data: alumni });
    } catch (err) {
      next(err);
    }
  };

  createUniversityAlumnus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const universityId = req.user!.id;
      const alumnus = await this.alumniUseCases.createUniversityAlumnus(universityId, req.body);
      res.status(201).json({ status: 'success', data: alumnus });
    } catch (err) {
      next(err);
    }
  };

  deleteUniversityAlumnus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { alumniId } = req.params;
      await this.alumniUseCases.deleteUniversityAlumnus(alumniId);
      res.status(200).json({ status: 'success', message: 'Egresado eliminado con éxito.' });
    } catch (err) {
      next(err);
    }
  };
}
