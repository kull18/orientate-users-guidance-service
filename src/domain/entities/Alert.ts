export interface AlertProps {
  id?: string;
  studentId: string;
  groupId?: string;
  alertType: string;
  status?: string;
  details?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Alert {
  public readonly id?: string;
  public readonly studentId: string;
  public readonly groupId?: string;
  public readonly alertType: string;
  public readonly status: string;
  public readonly details?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: AlertProps) {
    if (!props.studentId) throw new Error('Student ID is required for alert');
    if (!props.alertType) throw new Error('Alert type is required');

    this.id = props.id;
    this.studentId = props.studentId;
    this.groupId = props.groupId;
    this.alertType = props.alertType;
    this.status = props.status || 'PENDING';
    this.details = props.details;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
