import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Group } from '../../../domain/entities/Group';
import { Session } from '../../../domain/entities/Session';
import { CounselorInfo } from '../outputs/StudentRepositoryPort';
import { AvailabilitySlot } from '../outputs/CounselorRepositoryPort';

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
  getJoinedGroups(userId: string): Promise<Group[]>;
  scheduleAppointment(studentId: string, sessionDate: string, motive: string): Promise<Session>;
  getAppointments(studentId: string): Promise<Session[]>;
  getCounselor(studentId: string): Promise<CounselorInfo>;
  getCounselorAvailability(studentId: string): Promise<AvailabilitySlot[]>;
}
