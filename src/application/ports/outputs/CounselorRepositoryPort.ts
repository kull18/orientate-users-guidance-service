import { Group } from '../../../domain/entities/Group';
import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Session } from '../../../domain/entities/Session';
import { Task } from '../../../domain/entities/Task';
import { Alert } from '../../../domain/entities/Alert';

export interface StudentWithProfile {
  userId: string;
  name: string;
  email: string;
  subjectsLiked: string[];
  subjectsDisliked: string[];
  interests: string[];
  skills: string[];
  needsScholarship: boolean;
  studyAbroad: boolean;
  vocationalClarity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilitySlot {
  id?: string;
  counselorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CounselorRepositoryPort {
  saveGroup(group: Group): Promise<Group>;
  findGroupsByCounselorId(counselorId: string): Promise<Group[]>;
  findGroupById(groupId: string): Promise<Group | null>;
  findGroupByAccessCode(accessCode: string): Promise<Group | null>;
  findStudentsByGroupId(groupId: string): Promise<StudentWithProfile[]>;
  findStudentByUserId(studentId: string): Promise<StudentProfile | null>;
  saveSession(session: Session): Promise<Session>;
  saveTask(task: Task): Promise<Task>;
  findTasksByStudentId(studentId: string): Promise<Task[]>;
  findTasksByGroupId(groupId: string): Promise<Task[]>;
  findSessionsByStudentId(studentId: string): Promise<Session[]>;
  findAlertsByStudentId(studentId: string): Promise<Alert[]>;
  isStudentAssociatedWithCounselor(studentId: string, counselorId: string): Promise<boolean>;
  findStudentsByCounselorId(counselorId: string): Promise<StudentWithProfile[]>;
  updateGroup(group: Group): Promise<Group>;
  deleteGroup(groupId: string, counselorId: string): Promise<void>;
  findSessionsByCounselorId(counselorId: string): Promise<Session[]>;
  saveAvailability(counselorId: string, slots: { dayOfWeek: number, startTime: string, endTime: string }[]): Promise<void>;
  findAvailabilityByCounselorId(counselorId: string): Promise<AvailabilitySlot[]>;
}
