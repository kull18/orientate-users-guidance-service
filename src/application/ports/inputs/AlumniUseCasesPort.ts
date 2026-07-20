import { AlumniProfile } from '../../../domain/entities/AlumniProfile';
import { SuccessStory } from '../../../domain/entities/SuccessStory';

export interface AlumniUseCasesPort {
  getAlumniProfile(userId: string): Promise<AlumniProfile>;
  updateAlumniProfile(userId: string, data: any): Promise<AlumniProfile>;
  shareSuccessStory(userId: string, data: any): Promise<SuccessStory>;
  getMySuccessStories(userId: string): Promise<SuccessStory[]>;
  getApprovedSuccessStories(careerId?: string): Promise<SuccessStory[]>;
  getPendingSuccessStories(): Promise<SuccessStory[]>;
  approveSuccessStory(storyId: string): Promise<void>;
  rejectSuccessStory(storyId: string): Promise<void>;
  getUniversityAlumni(universityId: string): Promise<AlumniProfile[]>;
  createUniversityAlumnus(universityId: string, data: any): Promise<AlumniProfile>;
  deleteUniversityAlumnus(alumniId: string): Promise<void>;
}
