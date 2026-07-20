export interface AlumniProfileProps {
  userId: string;
  name?: string;
  email?: string;
  careerId: string;
  universityId: string;
  currentJob: string;
  company: string;
  graduationYear: number;
  experienceSummary?: string;
  linkedinUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AlumniProfile {
  public readonly userId: string;
  public readonly name?: string;
  public readonly email?: string;
  public readonly careerId: string;
  public readonly universityId: string;
  public readonly currentJob: string;
  public readonly company: string;
  public readonly graduationYear: number;
  public readonly experienceSummary?: string;
  public readonly linkedinUrl?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: AlumniProfileProps) {
    if (!props.userId) throw new Error('User ID cannot be empty');
    if (!props.careerId) throw new Error('Career ID cannot be empty');
    if (!props.universityId) throw new Error('University ID cannot be empty');
    if (!props.currentJob || props.currentJob.trim() === '') throw new Error('Current job cannot be empty');
    if (!props.company || props.company.trim() === '') throw new Error('Company cannot be empty');
    if (!props.graduationYear) throw new Error('Graduation year cannot be empty');

    this.userId = props.userId;
    this.name = props.name;
    this.email = props.email;
    this.careerId = props.careerId;
    this.universityId = props.universityId;
    this.currentJob = props.currentJob;
    this.company = props.company;
    this.graduationYear = props.graduationYear;
    this.experienceSummary = props.experienceSummary;
    this.linkedinUrl = props.linkedinUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
