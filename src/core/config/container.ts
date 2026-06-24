import { pool } from '../database/pgPool';
import { PostgresStudentRepository } from '../../infrastructure/adapters/outputs/db/PostgresStudentRepository';
import { PostgresCounselorRepository } from '../../infrastructure/adapters/outputs/db/PostgresCounselorRepository';
import { StudentRepositoryPort } from '../../application/ports/outputs/StudentRepositoryPort';
import { CounselorRepositoryPort } from '../../application/ports/outputs/CounselorRepositoryPort';

import { StudentUseCasesPort } from '../../application/ports/inputs/StudentUseCasesPort';
import { CounselorUseCasesPort } from '../../application/ports/inputs/CounselorUseCasesPort';

import { CreateStudentProfile } from '../../application/use-cases/CreateStudentProfile';
import { UpdateStudentProfile } from '../../application/use-cases/UpdateStudentProfile';
import { JoinGroup } from '../../application/use-cases/JoinGroup';

import { CreateGroup } from '../../application/use-cases/CreateGroup';
import { AssignTask } from '../../application/use-cases/AssignTask';
import { CreateSession } from '../../application/use-cases/CreateSession';
import { GetStudentFile } from '../../application/use-cases/GetStudentFile';

import { StudentController } from '../../infrastructure/adapters/inputs/http/controllers/StudentController';
import { CounselorController } from '../../infrastructure/adapters/inputs/http/controllers/CounselorController';

import { EntityNotFoundException, UnauthorizedActionException } from '../../domain/exceptions/BusinessException';

// 1. Output Adapters (Repositories)
export const studentRepository: StudentRepositoryPort = new PostgresStudentRepository(pool);
export const counselorRepository: CounselorRepositoryPort = new PostgresCounselorRepository(pool);

// 2. Concrete Use Cases
const createStudentProfileUseCase = new CreateStudentProfile(studentRepository);
const updateStudentProfileUseCase = new UpdateStudentProfile(studentRepository);
const joinGroupUseCase = new JoinGroup(studentRepository);

const createGroupUseCase = new CreateGroup(counselorRepository);
const assignTaskUseCase = new AssignTask(counselorRepository);
const createSessionUseCase = new CreateSession(counselorRepository);
const getStudentFileUseCase = new GetStudentFile(counselorRepository);

// 3. Input Ports Implementations (Services)
class StudentUseCasesImpl implements StudentUseCasesPort {
  constructor(
    private readonly createProfileUC: CreateStudentProfile,
    private readonly updateProfileUC: UpdateStudentProfile,
    private readonly joinGroupUC: JoinGroup,
    private readonly studentRepo: StudentRepositoryPort
  ) {}

  async createProfile(userId: string, data: any) {
    return this.createProfileUC.execute(userId, data);
  }

  async updateProfile(userId: string, data: any) {
    return this.updateProfileUC.execute(userId, data);
  }

  async joinGroup(userId: string, accessCode: string) {
    return this.joinGroupUC.execute(userId, accessCode);
  }

  async getProfile(userId: string) {
    const profile = await this.studentRepo.findByUserId(userId);
    if (!profile) {
      throw new EntityNotFoundException(`No se encontró el perfil vocacional para el usuario ${userId}`);
    }
    return profile;
  }
}

class CounselorUseCasesImpl implements CounselorUseCasesPort {
  constructor(
    private readonly createGrpUC: CreateGroup,
    private readonly assignTskUC: AssignTask,
    private readonly createSessUC: CreateSession,
    private readonly getFileUC: GetStudentFile,
    private readonly counselorRepo: CounselorRepositoryPort
  ) {}

  async createGroup(counselorId: string, name: string, accessCode: string) {
    return this.createGrpUC.execute(counselorId, name, accessCode);
  }

  async getGroups(counselorId: string) {
    return this.counselorRepo.findGroupsByCounselorId(counselorId);
  }

  async getStudentsInGroup(groupId: string, counselorId: string) {
    const group = await this.counselorRepo.findGroupById(groupId);
    if (!group) {
      throw new EntityNotFoundException(`Grupo no encontrado con ID ${groupId}`);
    }
    if (group.counselorId !== counselorId) {
      throw new UnauthorizedActionException('No tienes permisos para ver este grupo de estudiantes.');
    }
    return this.counselorRepo.findStudentsByGroupId(groupId);
  }

  async getStudentFile(studentId: string, counselorId: string) {
    return this.getFileUC.execute(studentId, counselorId);
  }

  async createSession(counselorId: string, studentId: string, data: any) {
    return this.createSessUC.execute(counselorId, studentId, data);
  }

  async assignTask(counselorId: string, data: any) {
    return this.assignTskUC.execute(counselorId, data);
  }
}

export const studentUseCases: StudentUseCasesPort = new StudentUseCasesImpl(
  createStudentProfileUseCase,
  updateStudentProfileUseCase,
  joinGroupUseCase,
  studentRepository
);

export const counselorUseCases: CounselorUseCasesPort = new CounselorUseCasesImpl(
  createGroupUseCase,
  assignTaskUseCase,
  createSessionUseCase,
  getStudentFileUseCase,
  counselorRepository
);

// 4. Input Adapters (HTTP Controllers)
export const studentController = new StudentController(studentUseCases);
export const counselorController = new CounselorController(counselorUseCases);
