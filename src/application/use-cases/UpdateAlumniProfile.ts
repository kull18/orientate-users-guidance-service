import { AlumniProfile } from '../../domain/entities/AlumniProfile';
import { AlumniRepositoryPort } from '../ports/outputs/AlumniRepositoryPort';

export class UpdateAlumniProfile {
  constructor(private readonly alumniRepo: AlumniRepositoryPort) {}

  async execute(userId: string, data: any): Promise<AlumniProfile> {
    const existing = await this.alumniRepo.findProfileByUserId(userId);
    
    const profile = new AlumniProfile({
      userId,
      name: data.name,
      email: data.email,
      careerId: data.careerId,
      universityId: data.universityId,
      currentJob: data.currentJob,
      company: data.company,
      graduationYear: data.graduationYear,
      experienceSummary: data.experienceSummary,
      linkedinUrl: data.linkedinUrl
    });

    if (existing) {
      return this.alumniRepo.updateProfile(profile);
    } else {
      return this.alumniRepo.saveProfile(profile);
    }
  }
}
