import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../../../../../core/middlewares/authMiddleware';
import { StudentUseCasesPort } from '../../../../../application/ports/inputs/StudentUseCasesPort';

export class StudentController {
  constructor(private readonly studentUseCases: StudentUseCasesPort) {}

  createProfile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.studentUseCases.createProfile(userId, req.body);
      res.status(201).json(profile);
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.studentUseCases.getProfile(userId);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.studentUseCases.updateProfile(userId, req.body);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  joinGroup = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { accessCode } = req.body;
      await this.studentUseCases.joinGroup(userId, accessCode);
      res.status(200).json({ message: 'Te has unido al grupo exitosamente.' });
    } catch (err) {
      next(err);
    }
  };
}
