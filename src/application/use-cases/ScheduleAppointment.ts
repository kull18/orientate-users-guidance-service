import { Session } from '../../domain/entities/Session';
import { StudentRepositoryPort } from '../ports/outputs/StudentRepositoryPort';
import { ValidationException } from '../../domain/exceptions/BusinessException';

export class ScheduleAppointment {
  constructor(private readonly studentRepo: StudentRepositoryPort) {}

  async execute(studentId: string, sessionDateStr: string, motive: string): Promise<Session> {
    if (!sessionDateStr) {
      throw new ValidationException('La fecha de la cita es requerida.');
    }
    if (!motive || motive.trim() === '') {
      throw new ValidationException('El motivo de la cita es requerido.');
    }

    const sessionDate = new Date(sessionDateStr);
    if (isNaN(sessionDate.getTime())) {
      throw new ValidationException('La fecha de la cita proporcionada no es válida.');
    }

    // 1. Validar que la fecha sea en el futuro
    if (sessionDate <= new Date()) {
      throw new ValidationException('No se puede agendar una cita en una fecha/hora que ya pasó.');
    }

    // 2. Obtener el orientador a partir de los grupos del alumno
    const groups = await this.studentRepo.findJoinedGroups(studentId);
    if (groups.length === 0) {
      throw new ValidationException('No tienes un orientador asignado. Debes unirte a un grupo primero.');
    }

    const counselorId = groups[0].counselorId;

    // A. Validar horario de disponibilidad del orientador
    const availability = await this.studentRepo.findCounselorAvailability(counselorId);
    if (availability.length === 0) {
      throw new ValidationException('El orientador no tiene horarios de disponibilidad configurados.');
    }

    const sessionDay = sessionDate.getDay();
    const sessionHours = sessionDate.getHours();
    const sessionMinutes = sessionDate.getMinutes();
    const sessionTimeInMinutes = sessionHours * 60 + sessionMinutes;

    const hasAvailability = availability.some(slot => {
      if (slot.dayOfWeek !== sessionDay) return false;
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const slotStart = startH * 60 + startM;
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const slotEnd = endH * 60 + endM;
      return sessionTimeInMinutes >= slotStart && (sessionTimeInMinutes + 60) <= slotEnd;
    });

    if (!hasAvailability) {
      throw new ValidationException('La cita está fuera del horario de disponibilidad del orientador.');
    }

    // 3. Validar solapamiento del orientador
    const counselorOverlap = await this.studentRepo.hasOverlappingSession(counselorId, 'counselor_id', sessionDate);
    if (counselorOverlap) {
      throw new ValidationException('El orientador ya tiene una cita agendada en ese horario o en un rango de 1 hora.');
    }

    // 4. Validar solapamiento del alumno
    const studentOverlap = await this.studentRepo.hasOverlappingSession(studentId, 'student_id', sessionDate);
    if (studentOverlap) {
      throw new ValidationException('Ya tienes otra cita agendada en ese horario o en un rango de 1 hora.');
    }

    // 5. Guardar la cita agendada
    const session = new Session({
      studentId,
      counselorId,
      sessionDate,
      motive,
      status: 'SCHEDULED'
    });

    return this.studentRepo.saveSession(session);
  }
}
