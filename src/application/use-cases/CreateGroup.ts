import { Group } from '../../domain/entities/Group';
import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { DuplicateEntityException, ValidationException } from '../../domain/exceptions/BusinessException';

export class CreateGroup {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(counselorId: string, name: string, accessCode?: string): Promise<Group> {
    if (!name || name.trim() === '') {
      throw new ValidationException('Group name cannot be empty');
    }

    let finalAccessCode: string = '';

    if (!accessCode || accessCode.trim() === '') {
      let codeExists = true;
      let attempts = 0;
      while (codeExists && attempts < 15) {
        finalAccessCode = this.generateRandomAccessCode(6);
        const existing = await this.counselorRepo.findGroupByAccessCode(finalAccessCode);
        if (!existing) {
          codeExists = false;
        }
        attempts++;
      }
      if (codeExists) {
        throw new Error('No se pudo generar un código de acceso único. Inténtalo de nuevo.');
      }
    } else {
      finalAccessCode = accessCode.trim();
      const existing = await this.counselorRepo.findGroupByAccessCode(finalAccessCode);
      if (existing) {
        throw new DuplicateEntityException(`El código de acceso "${finalAccessCode}" ya está en uso.`);
      }
    }

    const group = new Group({
      counselorId,
      name,
      accessCode: finalAccessCode,
    });

    return this.counselorRepo.saveGroup(group);
  }

  private generateRandomAccessCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
