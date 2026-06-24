import { StudentRepositoryPort } from '../ports/outputs/StudentRepositoryPort';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/BusinessException';

export class JoinGroup {
  constructor(private readonly studentRepo: StudentRepositoryPort) {}

  async execute(userId: string, accessCode: string): Promise<void> {
    if (!accessCode || accessCode.trim() === '') {
      throw new ValidationException('Access code is required');
    }

    // 1. Verify student profile exists
    const profile = await this.studentRepo.findByUserId(userId);
    if (!profile) {
      throw new ValidationException('Debe crear un perfil vocacional antes de unirse a un grupo.');
    }

    // 2. Find group by access code
    const group = await this.studentRepo.findGroupByAccessCode(accessCode);
    if (!group) {
      throw new EntityNotFoundException(`No se encontró un grupo con el código de acceso: ${accessCode}`);
    }

    // 3. Verify if student is already in this group
    if (!group.id) {
      throw new ValidationException('Internal error: Group ID is missing');
    }
    const alreadyJoined = await this.studentRepo.isStudentInGroup(userId, group.id);
    if (alreadyJoined) {
      throw new ValidationException('Ya eres miembro de este grupo.');
    }

    // 4. Join group
    await this.studentRepo.addStudentToGroup(userId, group.id);
  }
}
