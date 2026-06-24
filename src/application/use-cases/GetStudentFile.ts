import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { StudentFileResult } from '../ports/inputs/CounselorUseCasesPort';
import { EntityNotFoundException, UnauthorizedActionException } from '../../domain/exceptions/BusinessException';

export class GetStudentFile {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(studentId: string, counselorId: string): Promise<StudentFileResult> {
    // 1. Verify student profile exists
    const profile = await this.counselorRepo.findStudentByUserId(studentId);
    if (!profile) {
      throw new EntityNotFoundException(`No se encontró el expediente del estudiante con ID ${studentId}`);
    }

    // 2. Verify student is associated with the counselor
    const isAssociated = await this.counselorRepo.isStudentAssociatedWithCounselor(studentId, counselorId);
    if (!isAssociated) {
      throw new UnauthorizedActionException('No tienes permisos para acceder al expediente de este estudiante.');
    }

    // 3. Fetch consolidated data
    const [tasks, sessions, alerts] = await Promise.all([
      this.counselorRepo.findTasksByStudentId(studentId),
      this.counselorRepo.findSessionsByStudentId(studentId),
      this.counselorRepo.findAlertsByStudentId(studentId)
    ]);

    return {
      profile,
      tasks,
      sessions,
      alerts
    };
  }
}
