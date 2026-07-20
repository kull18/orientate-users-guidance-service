export interface SuccessStoryProps {
  id?: string;
  alumniId: string;
  title: string;
  content: string;
  status?: string; // 'PENDING', 'APPROVED', 'REJECTED'
  createdAt?: Date;
  updatedAt?: Date;
}

export class SuccessStory {
  public readonly id?: string;
  public readonly alumniId: string;
  public readonly title: string;
  public readonly content: string;
  public readonly status: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: SuccessStoryProps) {
    if (!props.alumniId) throw new Error('Alumni ID cannot be empty');
    if (!props.title || props.title.trim() === '') throw new Error('Title cannot be empty');
    if (!props.content || props.content.trim() === '') throw new Error('Content cannot be empty');

    this.id = props.id;
    this.alumniId = props.alumniId;
    this.title = props.title;
    this.content = props.content;
    this.status = props.status || 'PENDING';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
