import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Group } from '../../../domain/entities/Group';
import { Alert } from '../../../domain/entities/Alert';

export interface StudentRepositoryPort {
  saveProfile(profile: StudentProfile): Promise<StudentProfile>;
  findByUserId(userId: string): Promise<StudentProfile | null>;
  updateProfile(userId: string, profile: Partial<StudentProfile>): Promise<StudentProfile>;
  findGroupByAccessCode(accessCode: string): Promise<Group | null>;
  addStudentToGroup(userId: string, groupId: string): Promise<void>;
  isStudentInGroup(userId: string, groupId: string): Promise<boolean>;
  findJoinedGroups(userId: string): Promise<Group[]>;
  saveAlert(alert: Alert): Promise<Alert>;
}
