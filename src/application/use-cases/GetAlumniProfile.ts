import { AlumniProfile } from '../../domain/entities/AlumniProfile';
import { AlumniRepositoryPort } from '../ports/outputs/AlumniRepositoryPort';
import { EntityNotFoundException } from '../../domain/exceptions/BusinessException';

export class GetAlumniProfile {
  constructor(private readonly alumniRepo: AlumniRepositoryPort) {}

  async execute(userId: string): Promise<AlumniProfile> {
    const profile = await this.alumniRepo.findProfileByUserId(userId);
    if (!profile) {
      throw new EntityNotFoundException(`Perfil de egresado no encontrado para el usuario ${userId}`);
    }
    return profile;
  }
}
