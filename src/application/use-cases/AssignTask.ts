import { Task } from '../../domain/entities/Task';
import { CounselorRepositoryPort } from '../ports/outputs/CounselorRepositoryPort';
import { AssignTaskInput } from '../ports/inputs/CounselorUseCasesPort';
import { EntityNotFoundException, UnauthorizedActionException, ValidationException } from '../../domain/exceptions/BusinessException';

export class AssignTask {
  constructor(private readonly counselorRepo: CounselorRepositoryPort) {}

  async execute(counselorId: string, data: AssignTaskInput): Promise<Task> {
    if (!data.title || data.title.trim() === '') {
      throw new ValidationException('El título de la tarea es requerido.');
    }

    if (!data.groupId && !data.studentId) {
      throw new ValidationException('La tarea debe ser asignada a un estudiante o a un grupo.');
    }

    if (data.groupId && data.studentId) {
      throw new ValidationException('La tarea no puede ser asignada a ambos al mismo tiempo.');
    }

    // If assigned to group, check ownership
    if (data.groupId) {
      const group = await this.counselorRepo.findGroupById(data.groupId);
      if (!group) {
        throw new EntityNotFoundException(`No se encontró el grupo con ID ${data.groupId}`);
      }
      if (group.counselorId !== counselorId) {
        throw new UnauthorizedActionException('No tienes permisos para asignar tareas a este grupo.');
      }
    }

    // If assigned to student, check association
    if (data.studentId) {
      const student = await this.counselorRepo.findStudentByUserId(data.studentId);
      if (!student) {
        throw new EntityNotFoundException(`No se encontró el estudiante con ID ${data.studentId}`);
      }
      const isAssociated = await this.counselorRepo.isStudentAssociatedWithCounselor(data.studentId, counselorId);
      if (!isAssociated) {
        throw new UnauthorizedActionException('No tienes permisos para asignar tareas a este estudiante.');
      }
    }

    const task = new Task({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: 'PENDING',
      groupId: data.groupId,
      studentId: data.studentId
    });

    return this.counselorRepo.saveTask(task);
  }
}
