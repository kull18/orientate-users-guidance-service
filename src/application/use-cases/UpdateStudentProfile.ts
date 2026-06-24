import { StudentProfile } from '../../domain/entities/StudentProfile';
import { Alert } from '../../domain/entities/Alert';
import { StudentRepositoryPort } from '../ports/outputs/StudentRepositoryPort';
import { UpdateStudentProfileInput } from '../ports/inputs/StudentUseCasesPort';
import { EntityNotFoundException } from '../../domain/exceptions/BusinessException';

export class UpdateStudentProfile {
  constructor(private readonly studentRepo: StudentRepositoryPort) {}

  async execute(userId: string, data: UpdateStudentProfileInput): Promise<StudentProfile> {
    const existing = await this.studentRepo.findByUserId(userId);
    if (!existing) {
      throw new EntityNotFoundException(`Student profile not found for user ${userId}`);
    }

    const updatedProps = {
      subjectsLiked: data.subjectsLiked !== undefined ? data.subjectsLiked : existing.subjectsLiked,
      subjectsDisliked: data.subjectsDisliked !== undefined ? data.subjectsDisliked : existing.subjectsDisliked,
      interests: data.interests !== undefined ? data.interests : existing.interests,
      skills: data.skills !== undefined ? data.skills : existing.skills,
      needsScholarship: data.needsScholarship !== undefined ? data.needsScholarship : existing.needsScholarship,
      studyAbroad: data.studyAbroad !== undefined ? data.studyAbroad : existing.studyAbroad,
      vocationalClarity: data.vocationalClarity !== undefined ? data.vocationalClarity : existing.vocationalClarity,
    };

    const updatedProfile = await this.studentRepo.updateProfile(userId, updatedProps);

    // Trigger alerts if relevant values changed
    if (data.vocationalClarity !== undefined && data.vocationalClarity <= 3 && existing.vocationalClarity > 3) {
      await this.studentRepo.saveAlert(new Alert({
        studentId: updatedProfile.userId,
        alertType: 'HIGH_INDECISION',
        details: `El estudiante actualizó su claridad vocacional a un nivel bajo (${updatedProfile.vocationalClarity}/10).`,
        status: 'PENDING'
      }));
    }

    if (data.needsScholarship === true && !existing.needsScholarship) {
      await this.studentRepo.saveAlert(new Alert({
        studentId: updatedProfile.userId,
        alertType: 'SCHOLARSHIP_NEED',
        details: 'El estudiante actualizó su perfil indicando que ahora requiere apoyo de beca.',
        status: 'PENDING'
      }));
    }

    return updatedProfile;
  }
}
