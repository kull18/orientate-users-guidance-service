import { Group } from '../../domain/entities/Group';
import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { DuplicateEntityException, ValidationException } from '../../domain/exceptions/BusinessException';

export class CreateGroup {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(counselorId: string, name: string, accessCode: string): Promise<Group> {
    if (!name || name.trim() === '') {
      throw new ValidationException('Group name cannot be empty');
    }
    if (!accessCode || accessCode.trim() === '') {
      throw new ValidationException('Access code cannot be empty');
    }

    // Check if access code already exists
    const existing = await this.counselorRepo.findGroupByAccessCode(accessCode);
    if (existing) {
      throw new DuplicateEntityException(`El código de acceso "${accessCode}" ya está en uso.`);
    }

    const group = new Group({
      counselorId,
      name,
      accessCode,
    });

    return this.counselorRepo.saveGroup(group);
  }
}
