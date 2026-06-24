import { StudentProfile } from '../../domain/entities/StudentProfile';
import { Alert } from '../../domain/entities/Alert';
import { StudentRepositoryPort } from '../ports/outputs/StudentRepositoryPort';
import { CreateStudentProfileInput } from '../ports/inputs/StudentUseCasesPort';
import { DuplicateEntityException } from '../../domain/exceptions/BusinessException';

export class CreateStudentProfile {
  constructor(private readonly studentRepo: StudentRepositoryPort) {}

  async execute(userId: string, data: CreateStudentProfileInput): Promise<StudentProfile> {
    const existing = await this.studentRepo.findByUserId(userId);
    if (existing) {
      throw new DuplicateEntityException(`Student profile already exists for user ${userId}`);
    }

    const profile = new StudentProfile({
      userId,
      subjectsLiked: data.subjectsLiked,
      subjectsDisliked: data.subjectsDisliked,
      interests: data.interests,
      skills: data.skills,
      needsScholarship: data.needsScholarship,
      studyAbroad: data.studyAbroad,
      vocationalClarity: data.vocationalClarity,
    });

    const savedProfile = await this.studentRepo.saveProfile(profile);

    // Automatic alerts generation based on profile
    if (savedProfile.vocationalClarity <= 3) {
      await this.studentRepo.saveAlert(new Alert({
        studentId: savedProfile.userId,
        alertType: 'HIGH_INDECISION',
        details: `El estudiante reporta un nivel muy bajo de claridad vocacional (${savedProfile.vocationalClarity}/10).`,
        status: 'PENDING'
      }));
    }

    if (savedProfile.needsScholarship) {
      await this.studentRepo.saveAlert(new Alert({
        studentId: savedProfile.userId,
        alertType: 'SCHOLARSHIP_NEED',
        details: 'El estudiante indica que requiere apoyo de beca para sus estudios.',
        status: 'PENDING'
      }));
    }

    return savedProfile;
  }
}
