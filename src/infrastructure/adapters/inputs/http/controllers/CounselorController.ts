import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../../../../../core/middlewares/authMiddleware';
import { CounselorUseCasesPort } from '../../../../../application/ports/inputs/CounselorUseCasesPort';

export class CounselorController {
  constructor(private readonly counselorUseCases: CounselorUseCasesPort) {}

  createGroup = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { name, accessCode } = req.body;
      const group = await this.counselorUseCases.createGroup(counselorId, name, accessCode);
      res.status(201).json(group);
    } catch (err) {
      next(err);
    }
  };

  getGroups = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const groups = await this.counselorUseCases.getGroups(counselorId);
      res.status(200).json(groups);
    } catch (err) {
      next(err);
    }
  };

  getStudentsInGroup = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { groupId } = req.params;
      const students = await this.counselorUseCases.getStudentsInGroup(groupId, counselorId);
      res.status(200).json(students);
    } catch (err) {
      next(err);
    }
  };

  getStudentFile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { studentId } = req.params;
      const studentFile = await this.counselorUseCases.getStudentFile(studentId, counselorId);
      res.status(200).json(studentFile);
    } catch (err) {
      next(err);
    }
  };

  createSession = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { studentId } = req.params;
      const session = await this.counselorUseCases.createSession(counselorId, studentId, req.body);
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  };

  assignTask = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const task = await this.counselorUseCases.assignTask(counselorId, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  getStudents = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const students = await this.counselorUseCases.getStudents(counselorId);
      res.status(200).json(students);
    } catch (err) {
      next(err);
    }
  };

  getGroupDetails = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { groupId } = req.params;
      const group = await this.counselorUseCases.getGroupDetails(groupId, counselorId);
      res.status(200).json(group);
    } catch (err) {
      next(err);
    }
  };

  updateGroup = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { groupId } = req.params;
      const { name, accessCode } = req.body;
      const group = await this.counselorUseCases.updateGroup(groupId, counselorId, name, accessCode);
      res.status(200).json(group);
    } catch (err) {
      next(err);
    }
  };

  getAppointments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const appointments = await this.counselorUseCases.getAppointments(counselorId);
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  };

  deleteGroup = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { groupId } = req.params;
      await this.counselorUseCases.deleteGroup(groupId, counselorId);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Grupo eliminado exitosamente.'
      });
    } catch (err) {
      next(err);
    }
  };

  setAvailability = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const { slots } = req.body;
      await this.counselorUseCases.setAvailability(counselorId, slots);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Horario de disponibilidad guardado exitosamente.'
      });
    } catch (err) {
      next(err);
    }
  };

  getAvailability = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counselorId = req.user!.id;
      const availability = await this.counselorUseCases.getAvailability(counselorId);
      res.status(200).json(availability);
    } catch (err) {
      next(err);
    }
  };
}
