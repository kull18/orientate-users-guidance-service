import { SuccessStory } from '../../domain/entities/SuccessStory';
import { AlumniRepositoryPort } from '../ports/outputs/AlumniRepositoryPort';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/BusinessException';

export class ShareSuccessStory {
  constructor(private readonly alumniRepo: AlumniRepositoryPort) {}

  async execute(userId: string, data: any): Promise<SuccessStory> {
    const profile = await this.alumniRepo.findProfileByUserId(userId);
    if (!profile) {
      throw new ValidationException('Debes completar tu perfil de egresado antes de poder compartir una historia de éxito.');
    }

    const story = new SuccessStory({
      alumniId: userId,
      title: data.title,
      content: data.content,
      status: 'PENDING'
    });

    return this.alumniRepo.saveStory(story);
  }
}
