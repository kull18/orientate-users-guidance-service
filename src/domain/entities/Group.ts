export interface GroupProps {
  id?: string;
  counselorId: string;
  name: string;
  accessCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Group {
  public readonly id?: string;
  public readonly counselorId: string;
  public readonly name: string;
  public readonly accessCode: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: GroupProps) {
    if (!props.name || props.name.trim() === '') {
      throw new Error('Group name cannot be empty');
    }
    if (!props.accessCode || props.accessCode.trim() === '') {
      throw new Error('Access code cannot be empty');
    }
    this.id = props.id;
    this.counselorId = props.counselorId;
    this.name = props.name;
    this.accessCode = props.accessCode;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
