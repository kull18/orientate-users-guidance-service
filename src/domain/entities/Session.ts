export interface SessionProps {
  id?: string;
  studentId: string;
  counselorId: string;
  sessionDate: Date;
  motive: string;
  observations?: string;
  agreement?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Session {
  public readonly id?: string;
  public readonly studentId: string;
  public readonly counselorId: string;
  public readonly sessionDate: Date;
  public readonly motive: string;
  public readonly observations?: string;
  public readonly agreement?: string;
  public readonly status: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: SessionProps) {
    if (!props.studentId) throw new Error('Student ID is required');
    if (!props.counselorId) throw new Error('Counselor ID is required');
    if (!props.motive || props.motive.trim() === '') throw new Error('Motive is required');
    if (!props.sessionDate) throw new Error('Session date is required');

    this.id = props.id;
    this.studentId = props.studentId;
    this.counselorId = props.counselorId;
    this.sessionDate = props.sessionDate;
    this.motive = props.motive;
    this.observations = props.observations;
    this.agreement = props.agreement;
    this.status = props.status || 'SCHEDULED';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
