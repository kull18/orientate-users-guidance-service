import { pool } from '../database/pgPool';
import { PostgresStudentRepository } from '../../infrastructure/adapters/outputs/db/PostgresStudentRepository';
import { PostgresCounselorRepository } from '../../infrastructure/adapters/outputs/db/PostgresCounselorRepository';
import { PostgresAlumniRepository } from '../../infrastructure/adapters/outputs/db/PostgresAlumniRepository';
import { StudentRepositoryPort, CounselorInfo } from '../../application/ports/outputs/StudentRepositoryPort';
import { CounselorRepositoryPort, StudentWithProfile } from '../../application/ports/outputs/CounselorRepositoryPort';
import { AlumniRepositoryPort } from '../../application/ports/outputs/AlumniRepositoryPort';

import { StudentUseCasesPort } from '../../application/ports/inputs/StudentUseCasesPort';
import { CounselorUseCasesPort } from '../../application/ports/inputs/CounselorUseCasesPort';
import { AlumniUseCasesPort } from '../../application/ports/inputs/AlumniUseCasesPort';

import { CreateStudentProfile } from '../../application/use-cases/CreateStudentProfile';
import { UpdateStudentProfile } from '../../application/use-cases/UpdateStudentProfile';
import { JoinGroup } from '../../application/use-cases/JoinGroup';
import { ScheduleAppointment } from '../../application/use-cases/ScheduleAppointment';

import { CreateGroup } from '../../application/use-cases/CreateGroup';
import { AssignTask } from '../../application/use-cases/AssignTask';
import { CreateSession } from '../../application/use-cases/CreateSession';
import { GetStudentFile } from '../../application/use-cases/GetStudentFile';
import { DeleteGroup } from '../../application/use-cases/DeleteGroup';

import { GetAlumniProfile } from '../../application/use-cases/GetAlumniProfile';
import { UpdateAlumniProfile } from '../../application/use-cases/UpdateAlumniProfile';
import { ShareSuccessStory } from '../../application/use-cases/ShareSuccessStory';

import { StudentController } from '../../infrastructure/adapters/inputs/http/controllers/StudentController';
import { CounselorController } from '../../infrastructure/adapters/inputs/http/controllers/CounselorController';
import { AlumniController } from '../../infrastructure/adapters/inputs/http/controllers/AlumniController';

import { EntityNotFoundException, UnauthorizedActionException, DuplicateEntityException, ValidationException } from '../../domain/exceptions/BusinessException';
import { AvailabilitySlot } from '../../application/ports/outputs/CounselorRepositoryPort';
import { Group } from '../../domain/entities/Group';

// 1. Output Adapters (Repositories)
export const studentRepository: StudentRepositoryPort = new PostgresStudentRepository(pool);
export const counselorRepository: CounselorRepositoryPort = new PostgresCounselorRepository(pool);
export const alumniRepository: AlumniRepositoryPort = new PostgresAlumniRepository(pool);

// 2. Concrete Use Cases
const createStudentProfileUseCase = new CreateStudentProfile(studentRepository);
const updateStudentProfileUseCase = new UpdateStudentProfile(studentRepository);
const joinGroupUseCase = new JoinGroup(studentRepository);
const scheduleAppointmentUseCase = new ScheduleAppointment(studentRepository);

const createGroupUseCase = new CreateGroup(counselorRepository);
const assignTaskUseCase = new AssignTask(counselorRepository);
const createSessionUseCase = new CreateSession(counselorRepository);
const getStudentFileUseCase = new GetStudentFile(counselorRepository);
const deleteGroupUseCase = new DeleteGroup(counselorRepository);

const getAlumniProfileUseCase = new GetAlumniProfile(alumniRepository);
const updateAlumniProfileUseCase = new UpdateAlumniProfile(alumniRepository);
const shareSuccessStoryUseCase = new ShareSuccessStory(alumniRepository);

// 3. Input Ports Implementations (Services)
class StudentUseCasesImpl implements StudentUseCasesPort {
  constructor(
    private readonly createProfileUC: CreateStudentProfile,
    private readonly updateProfileUC: UpdateStudentProfile,
    private readonly joinGroupUC: JoinGroup,
    private readonly scheduleAppointmentUC: ScheduleAppointment,
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

  async getJoinedGroups(userId: string) {
    return this.studentRepo.findJoinedGroups(userId);
  }

  async scheduleAppointment(studentId: string, sessionDate: string, motive: string) {
    return this.scheduleAppointmentUC.execute(studentId, sessionDate, motive);
  }

  async getAppointments(studentId: string) {
    return this.studentRepo.findSessionsByStudentId(studentId);
  }

  async getCounselor(studentId: string): Promise<CounselorInfo> {
    const counselor = await this.studentRepo.findCounselorByStudentId(studentId);
    if (!counselor) {
      throw new EntityNotFoundException('No tienes un orientador asignado. Debes unirte a un grupo primero.');
    }
    return counselor;
  }

  async getCounselorAvailability(studentId: string): Promise<AvailabilitySlot[]> {
    const counselor = await this.studentRepo.findCounselorByStudentId(studentId);
    if (!counselor) {
      throw new EntityNotFoundException('No tienes un orientador asignado. Debes unirte a un grupo primero.');
    }
    return this.studentRepo.findCounselorAvailability(counselor.id);
  }
}

class CounselorUseCasesImpl implements CounselorUseCasesPort {
  constructor(
    private readonly createGrpUC: CreateGroup,
    private readonly assignTskUC: AssignTask,
    private readonly createSessUC: CreateSession,
    private readonly getFileUC: GetStudentFile,
    private readonly deleteGrpUC: DeleteGroup,
    private readonly counselorRepo: CounselorRepositoryPort
  ) {}

  async createGroup(counselorId: string, name: string, accessCode?: string) {
    return this.createGrpUC.execute(counselorId, name, accessCode);
  }

  async getGroups(counselorId: string) {
    return this.counselorRepo.findGroupsByCounselorId(counselorId);
  }

  async getStudentsInGroup(groupId: string, counselorId: string): Promise<StudentWithProfile[]> {
    const group = await this.counselorRepo.findGroupById(groupId);
    if (!group) {
      throw new EntityNotFoundException(`Grupo no encontrado con ID ${groupId}`);
    }
    if (group.counselorId !== counselorId) {
      throw new UnauthorizedActionException('No tienes permisos para acceder a los alumnos de este grupo.');
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

  async getStudents(counselorId: string): Promise<StudentWithProfile[]> {
    return this.counselorRepo.findStudentsByCounselorId(counselorId);
  }

  async getGroupDetails(groupId: string, counselorId: string): Promise<Group> {
    const group = await this.counselorRepo.findGroupById(groupId);
    if (!group) {
      throw new EntityNotFoundException(`Grupo no encontrado con ID ${groupId}`);
    }
    if (group.counselorId !== counselorId) {
      throw new UnauthorizedActionException('No tienes permisos para ver los detalles de este grupo.');
    }
    return group;
  }

  async updateGroup(groupId: string, counselorId: string, name?: string, accessCode?: string): Promise<Group> {
    const group = await this.counselorRepo.findGroupById(groupId);
    if (!group) {
      throw new EntityNotFoundException(`Grupo no encontrado con ID ${groupId}`);
    }
    if (group.counselorId !== counselorId) {
      throw new UnauthorizedActionException('No tienes permisos para modificar este grupo.');
    }

    if (accessCode && accessCode !== group.accessCode) {
      const existing = await this.counselorRepo.findGroupByAccessCode(accessCode);
      if (existing) {
        throw new DuplicateEntityException('El código de acceso ya está en uso por otro grupo.');
      }
    }

    const updatedGroup = new Group({
      id: group.id,
      counselorId: group.counselorId,
      name: name || group.name,
      accessCode: accessCode || group.accessCode,
      createdAt: group.createdAt,
      updatedAt: new Date()
    });

    return this.counselorRepo.updateGroup(updatedGroup);
  }

  async getAppointments(counselorId: string) {
    return this.counselorRepo.findSessionsByCounselorId(counselorId);
  }

  async deleteGroup(groupId: string, counselorId: string): Promise<void> {
    return this.deleteGrpUC.execute(groupId, counselorId);
  }

  async setAvailability(counselorId: string, slots: { dayOfWeek: number, startTime: string, endTime: string }[]): Promise<void> {
    if (slots && slots.length > 0) {
      for (const slot of slots) {
        if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
          throw new ValidationException('El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado).');
        }
        if (!/^\d{2}:\d{2}$/.test(slot.startTime) || !/^\d{2}:\d{2}$/.test(slot.endTime)) {
          throw new ValidationException('Las horas deben estar en formato HH:MM.');
        }
      }
    }
    await this.counselorRepo.saveAvailability(counselorId, slots);
  }

  async getAvailability(counselorId: string): Promise<AvailabilitySlot[]> {
    return this.counselorRepo.findAvailabilityByCounselorId(counselorId);
  }
}

class AlumniUseCasesImpl implements AlumniUseCasesPort {
  constructor(
    private readonly getProfileUC: GetAlumniProfile,
    private readonly updateProfileUC: UpdateAlumniProfile,
    private readonly shareStoryUC: ShareSuccessStory,
    private readonly alumniRepo: AlumniRepositoryPort
  ) {}

  async getAlumniProfile(userId: string) {
    return this.getProfileUC.execute(userId);
  }

  async updateAlumniProfile(userId: string, data: any) {
    return this.updateProfileUC.execute(userId, data);
  }

  async shareSuccessStory(userId: string, data: any) {
    return this.shareStoryUC.execute(userId, data);
  }

  async getMySuccessStories(userId: string) {
    return this.alumniRepo.findStoriesByAlumniId(userId);
  }

  async getApprovedSuccessStories(careerId?: string) {
    return this.alumniRepo.findAllApprovedStories(careerId);
  }

  async getPendingSuccessStories() {
    return this.alumniRepo.findPendingStories();
  }

  async approveSuccessStory(storyId: string) {
    return this.alumniRepo.updateStoryStatus(storyId, 'APPROVED');
  }

  async rejectSuccessStory(storyId: string) {
    return this.alumniRepo.updateStoryStatus(storyId, 'REJECTED');
  }

  async getUniversityAlumni(universityId: string) {
    return this.alumniRepo.findProfilesByUniversityId(universityId);
  }

  async createUniversityAlumnus(universityId: string, data: any) {
    const { v4: uuidv4 } = require('uuid');
    const { AlumniProfile } = require('../../domain/entities/AlumniProfile');
    const newUserId = uuidv4();
    const profile = new AlumniProfile({
      userId: newUserId,
      name: data.name,
      email: data.email,
      careerId: data.careerId,
      universityId: universityId,
      currentJob: data.currentJob,
      company: data.company,
      graduationYear: data.graduationYear,
      experienceSummary: data.experienceSummary,
      linkedinUrl: data.linkedinUrl
    });
    return this.alumniRepo.saveProfile(profile);
  }

  async deleteUniversityAlumnus(alumniId: string) {
    return this.alumniRepo.deleteProfileByUserId(alumniId);
  }
}

export const studentUseCases: StudentUseCasesPort = new StudentUseCasesImpl(
  createStudentProfileUseCase,
  updateStudentProfileUseCase,
  joinGroupUseCase,
  scheduleAppointmentUseCase,
  studentRepository
);

export const counselorUseCases: CounselorUseCasesPort = new CounselorUseCasesImpl(
  createGroupUseCase,
  assignTaskUseCase,
  createSessionUseCase,
  getStudentFileUseCase,
  deleteGroupUseCase,
  counselorRepository
);

export const alumniUseCases: AlumniUseCasesPort = new AlumniUseCasesImpl(
  getAlumniProfileUseCase,
  updateAlumniProfileUseCase,
  shareSuccessStoryUseCase,
  alumniRepository
);

// 4. Input Adapters (HTTP Controllers)
export const studentController = new StudentController(studentUseCases);
export const counselorController = new CounselorController(counselorUseCases);
export const alumniController = new AlumniController(alumniUseCases);

// 5. Distributed Event Bus (Redis)
import { RedisEventBus } from '../../infrastructure/adapters/outputs/events/RedisEventBus';
import { env } from './env';
export const eventBus = new RedisEventBus(env.REDIS_URL);
