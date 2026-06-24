import { StudentProfile } from '../../../domain/entities/StudentProfile';

export interface CreateStudentProfileInput {
  subjectsLiked: string[];
  subjectsDisliked: string[];
  interests: string[];
  skills: string[];
  needsScholarship: boolean;
  studyAbroad: boolean;
  vocationalClarity: number;
}

export interface UpdateStudentProfileInput {
  subjectsLiked?: string[];
  subjectsDisliked?: string[];
  interests?: string[];
  skills?: string[];
  needsScholarship?: boolean;
  studyAbroad?: boolean;
  vocationalClarity?: number;
}

export interface StudentUseCasesPort {
  createProfile(userId: string, data: CreateStudentProfileInput): Promise<StudentProfile>;
  getProfile(userId: string): Promise<StudentProfile>;
  updateProfile(userId: string, data: UpdateStudentProfileInput): Promise<StudentProfile>;
  joinGroup(userId: string, accessCode: string): Promise<void>;
}
