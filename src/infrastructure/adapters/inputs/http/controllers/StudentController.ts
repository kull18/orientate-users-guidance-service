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

  getJoinedGroups = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const groups = await this.studentUseCases.getJoinedGroups(userId);
      res.status(200).json(groups);
    } catch (err) {
      next(err);
    }
  };

  scheduleAppointment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { sessionDate, motive } = req.body;
      const session = await this.studentUseCases.scheduleAppointment(userId, sessionDate, motive);
      res.status(201).json({
        status: 'success',
        data: session
      });
    } catch (err) {
      next(err);
    }
  };

  getAppointments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const appointments = await this.studentUseCases.getAppointments(userId);
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  };

  getCounselorInfo = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const counselor = await this.studentUseCases.getCounselor(userId);
      res.status(200).json(counselor);
    } catch (err) {
      next(err);
    }
  };

  getCounselorAvailability = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const availability = await this.studentUseCases.getCounselorAvailability(userId);
      res.status(200).json(availability);
    } catch (err) {
      next(err);
    }
  };
}

