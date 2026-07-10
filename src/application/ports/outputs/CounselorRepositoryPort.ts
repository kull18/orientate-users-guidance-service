import { Group } from '../../../domain/entities/Group';
import { StudentProfile } from '../../../domain/entities/StudentProfile';
import { Session } from '../../../domain/entities/Session';
import { Task } from '../../../domain/entities/Task';
import { Alert } from '../../../domain/entities/Alert';

export interface CounselorRepositoryPort {
  saveGroup(group: Group): Promise<Group>;
  findGroupsByCounselorId(counselorId: string): Promise<Group[]>;
  findGroupById(groupId: string): Promise<Group | null>;
  findGroupByAccessCode(accessCode: string): Promise<Group | null>;
  findStudentsByGroupId(groupId: string): Promise<StudentProfile[]>;
  findStudentByUserId(studentId: string): Promise<StudentProfile | null>;
  saveSession(session: Session): Promise<Session>;
  saveTask(task: Task): Promise<Task>;
  findTasksByStudentId(studentId: string): Promise<Task[]>;
  findTasksByGroupId(groupId: string): Promise<Task[]>;
  findSessionsByStudentId(studentId: string): Promise<Session[]>;
  findAlertsByStudentId(studentId: string): Promise<Alert[]>;
  isStudentAssociatedWithCounselor(studentId: string, counselorId: string): Promise<boolean>;
  findStudentsByCounselorId(counselorId: string): Promise<StudentProfile[]>;
  updateGroup(group: Group): Promise<Group>;
}
