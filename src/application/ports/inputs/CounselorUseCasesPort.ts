import { Group } from '../../../domain/entities/Group';
import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Session } from '../../../domain/entities/Session';
import { Task } from '../../../domain/entities/Task';
import { Alert } from '../../../domain/entities/Alert';
import { StudentWithProfile, AvailabilitySlot } from '../outputs/CounselorRepositoryPort';

export interface CreateSessionInput {
  sessionDate: Date;
  motive: string;
  observations?: string;
  agreement?: string;
}

export interface AssignTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  groupId?: string;
  studentId?: string;
}

export interface StudentFileResult {
  profile: StudentProfile;
  tasks: Task[];
  sessions: Session[];
  alerts: Alert[];
}

export interface CounselorUseCasesPort {
  createGroup(counselorId: string, name: string, accessCode?: string): Promise<Group>;
  getGroups(counselorId: string): Promise<Group[]>;
  getStudentsInGroup(groupId: string, counselorId: string): Promise<StudentWithProfile[]>;
  getStudentFile(studentId: string, counselorId: string): Promise<StudentFileResult>;
  createSession(counselorId: string, studentId: string, data: CreateSessionInput): Promise<Session>;
  assignTask(counselorId: string, data: AssignTaskInput): Promise<Task>;
  getStudents(counselorId: string): Promise<StudentWithProfile[]>;
  getGroupDetails(groupId: string, counselorId: string): Promise<Group>;
  updateGroup(groupId: string, counselorId: string, name?: string, accessCode?: string): Promise<Group>;
  deleteGroup(groupId: string, counselorId: string): Promise<void>;
  getAppointments(counselorId: string): Promise<Session[]>;
  setAvailability(counselorId: string, slots: { dayOfWeek: number, startTime: string, endTime: string }[]): Promise<void>;
  getAvailability(counselorId: string): Promise<AvailabilitySlot[]>;
}
