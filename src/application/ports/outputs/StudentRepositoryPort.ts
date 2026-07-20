import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Group } from '../../../domain/entities/Group';
import { Alert } from '../../../domain/entities/Alert';
import { Session } from '../../../domain/entities/Session';
import { AvailabilitySlot } from './CounselorRepositoryPort';

export interface CounselorInfo {
  id: string;
  name: string;
  email: string;
}

export interface StudentRepositoryPort {
  saveProfile(profile: StudentProfile): Promise<StudentProfile>;
  findByUserId(userId: string): Promise<StudentProfile | null>;
  updateProfile(userId: string, profile: Partial<StudentProfile>): Promise<StudentProfile>;
  findGroupByAccessCode(accessCode: string): Promise<Group | null>;
  addStudentToGroup(userId: string, groupId: string): Promise<void>;
  isStudentInGroup(userId: string, groupId: string): Promise<boolean>;
  findJoinedGroups(userId: string): Promise<Group[]>;
  saveAlert(alert: Alert): Promise<Alert>;
  hasOverlappingSession(id: string, roleField: 'counselor_id' | 'student_id', date: Date): Promise<boolean>;
  saveSession(session: Session): Promise<Session>;
  findSessionsByStudentId(studentId: string): Promise<Session[]>;
  findCounselorByStudentId(studentId: string): Promise<CounselorInfo | null>;
  findCounselorAvailability(counselorId: string): Promise<AvailabilitySlot[]>;
}
