import { Session } from '../../domain/entities/Session';
import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { CreateSessionInput } from '../ports/inputs/CounselorUseCasesPort';
import { EntityNotFoundException, UnauthorizedActionException, ValidationException } from '../../domain/exceptions/BusinessException';

export class CreateSession {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(counselorId: string, studentId: string, data: CreateSessionInput): Promise<Session> {
    if (!data.sessionDate) {
      throw new ValidationException('La fecha de la sesión es requerida.');
    }
    if (!data.motive || data.motive.trim() === '') {
      throw new ValidationException('El motivo de la sesión es requerido.');
    }

    // 1. Verify student profile exists
    const student = await this.counselorRepo.findStudentByUserId(studentId);
    if (!student) {
      throw new EntityNotFoundException(`No se encontró al estudiante con ID ${studentId}`);
    }

    // 2. Verify student is associated with the counselor
    const isAssociated = await this.counselorRepo.isStudentAssociatedWithCounselor(studentId, counselorId);
    if (!isAssociated) {
      throw new UnauthorizedActionException('No tienes permisos para agendar sesiones con este estudiante.');
    }

    const session = new Session({
      studentId,
      counselorId,
      sessionDate: new Date(data.sessionDate),
      motive: data.motive,
      observations: data.observations,
      agreement: data.agreement,
      status: 'SCHEDULED'
    });

    return this.counselorRepo.saveSession(session);
  }
}
