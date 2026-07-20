import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { EntityNotFoundException, UnauthorizedActionException } from '../../domain/exceptions/BusinessException';

export class DeleteGroup {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(groupId: string, counselorId: string): Promise<void> {
    const group = await this.counselorRepo.findGroupById(groupId);
    if (!group) {
      throw new EntityNotFoundException(`Grupo no encontrado con ID ${groupId}`);
    }
    
    if (group.counselorId !== counselorId) {
      throw new UnauthorizedActionException('No tienes permisos para eliminar este grupo.');
    }

    await this.counselorRepo.deleteGroup(groupId, counselorId);
  }
}
