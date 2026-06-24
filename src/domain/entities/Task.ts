export interface TaskProps {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  groupId?: string;
  studentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  public readonly id?: string;
  public readonly title: string;
  public readonly description?: string;
  public readonly dueDate?: Date;
  public readonly status: string;
  public readonly groupId?: string;
  public readonly studentId?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TaskProps) {
    if (!props.title || props.title.trim() === '') {
      throw new Error('Task title cannot be empty');
    }
    if (!props.groupId && !props.studentId) {
      throw new Error('Task must be assigned to either a student or a group');
    }

    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.dueDate = props.dueDate;
    this.status = props.status || 'PENDING';
    this.groupId = props.groupId;
    this.studentId = props.studentId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
