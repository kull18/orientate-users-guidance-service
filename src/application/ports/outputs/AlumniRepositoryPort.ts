import { AlumniProfile } from '../../../domain/entities/AlumniProfile';
import { SuccessStory } from '../../../domain/entities/SuccessStory';

export interface AlumniRepositoryPort {
  saveProfile(profile: AlumniProfile): Promise<AlumniProfile>;
  findProfileByUserId(userId: string): Promise<AlumniProfile | null>;
  updateProfile(profile: AlumniProfile): Promise<AlumniProfile>;
  
  saveStory(story: SuccessStory): Promise<SuccessStory>;
  findStoryById(storyId: string): Promise<SuccessStory | null>;
  findStoriesByAlumniId(alumniId: string): Promise<SuccessStory[]>;
  findAllApprovedStories(careerId?: string): Promise<SuccessStory[]>;
  findPendingStories(): Promise<SuccessStory[]>;
  updateStoryStatus(storyId: string, status: string): Promise<void>;

  findProfilesByUniversityId(universityId: string): Promise<AlumniProfile[]>;
  deleteProfileByUserId(userId: string): Promise<void>;
}
