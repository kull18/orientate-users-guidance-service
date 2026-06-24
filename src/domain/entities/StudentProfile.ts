export interface StudentProfileProps {
  id?: string;
  userId: string;
  subjectsLiked: string[];
  subjectsDisliked: string[];
  interests: string[];
  skills: string[];
  needsScholarship: boolean;
  studyAbroad: boolean;
  vocationalClarity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StudentProfile {
  public readonly id?: string;
  public readonly userId: string;
  public readonly subjectsLiked: string[];
  public readonly subjectsDisliked: string[];
  public readonly interests: string[];
  public readonly skills: string[];
  public readonly needsScholarship: boolean;
  public readonly studyAbroad: boolean;
  public readonly vocationalClarity: number;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: StudentProfileProps) {
    if (props.vocationalClarity < 1 || props.vocationalClarity > 10) {
      throw new Error('Vocational clarity must be between 1 and 10');
    }
    this.id = props.id;
    this.userId = props.userId;
    this.subjectsLiked = props.subjectsLiked || [];
    this.subjectsDisliked = props.subjectsDisliked || [];
    this.interests = props.interests || [];
    this.skills = props.skills || [];
    this.needsScholarship = !!props.needsScholarship;
    this.studyAbroad = !!props.studyAbroad;
    this.vocationalClarity = props.vocationalClarity;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
