import { Pool } from 'pg';
import { StudentRepositoryPort } from '../../../../application/ports/outputs/StudentRepositoryPort';
import { StudentProfile } from '../../../../domain/entities/StudentProfile';
import { Group } from '../../../../domain/entities/Group';
import { Alert } from '../../../../domain/entities/Alert';
import { DatabaseException } from '../../../../domain/exceptions/BusinessException';

export class PostgresStudentRepository implements StudentRepositoryPort {
  constructor(private readonly pool: Pool) {}

  private mapRowToProfile(row: any): StudentProfile {
    return new StudentProfile({
      id: row.id,
      userId: row.user_id,
      subjectsLiked: row.subjects_liked || [],
      subjectsDisliked: row.subjects_disliked || [],
      interests: row.interests || [],
      skills: row.skills || [],
      needsScholarship: row.needs_scholarship,
      studyAbroad: row.study_abroad,
      vocationalClarity: row.vocational_clarity,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  private mapRowToGroup(row: any): Group {
    return new Group({
      id: row.id,
      counselorId: row.counselor_id,
      name: row.name,
      accessCode: row.access_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async saveProfile(profile: StudentProfile): Promise<StudentProfile> {
    const query = `
      INSERT INTO student_profiles (
        user_id, subjects_liked, subjects_disliked, interests, skills, needs_scholarship, study_abroad, vocational_clarity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      profile.userId,
      profile.subjectsLiked,
      profile.subjectsDisliked,
      profile.interests,
      profile.skills,
      profile.needsScholarship,
      profile.studyAbroad,
      profile.vocationalClarity
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error saving student profile: ${error.message}`);
    }
  }

  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const query = 'SELECT * FROM student_profiles WHERE user_id = $1;';
    try {
      const result = await this.pool.query(query, [userId]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding student profile: ${error.message}`);
    }
  }

  async updateProfile(userId: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
    // Dynamically build the update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldsToUpdate: { [key: string]: any } = {
      subjects_liked: profile.subjectsLiked,
      subjects_disliked: profile.subjectsDisliked,
      interests: profile.interests,
      skills: profile.skills,
      needs_scholarship: profile.needsScholarship,
      study_abroad: profile.studyAbroad,
      vocational_clarity: profile.vocationalClarity,
      updated_at: new Date()
    };

    for (const [key, val] of Object.entries(fieldsToUpdate)) {
      if (val !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      // Nothing to update, return current profile
      const current = await this.findByUserId(userId);
      if (!current) throw new DatabaseException('Profile not found during update');
      return current;
    }

    values.push(userId);
    const query = `
      UPDATE student_profiles
      SET ${setClauses.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *;
    `;

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new DatabaseException(`Student profile not found to update for user ${userId}`);
      }
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error updating student profile: ${error.message}`);
    }
  }

  async findGroupByAccessCode(accessCode: string): Promise<Group | null> {
    const query = 'SELECT * FROM groups WHERE access_code = $1;';
    try {
      const result = await this.pool.query(query, [accessCode]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapRowToGroup(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding group by access code: ${error.message}`);
    }
  }

  async addStudentToGroup(userId: string, groupId: string): Promise<void> {
    const query = 'INSERT INTO student_group (user_id, group_id) VALUES ($1, $2);';
    try {
      await this.pool.query(query, [userId, groupId]);
    } catch (error: any) {
      throw new DatabaseException(`Error joining group: ${error.message}`);
    }
  }

  async isStudentInGroup(userId: string, groupId: string): Promise<boolean> {
    const query = 'SELECT COUNT(1) FROM student_group WHERE user_id = $1 AND group_id = $2;';
    try {
      const result = await this.pool.query(query, [userId, groupId]);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error: any) {
      throw new DatabaseException(`Error checking student membership in group: ${error.message}`);
    }
  }

  async saveAlert(alert: Alert): Promise<Alert> {
    const query = `
      INSERT INTO alerts (student_id, group_id, alert_type, status, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      alert.studentId,
      alert.groupId || null,
      alert.alertType,
      alert.status,
      alert.details || null
    ];

    try {
      const result = await this.pool.query(query, values);
      const row = result.rows[0];
      return new Alert({
        id: row.id,
        studentId: row.student_id,
        groupId: row.group_id,
        alertType: row.alert_type,
        status: row.status,
        details: row.details,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (error: any) {
      throw new DatabaseException(`Error saving alert: ${error.message}`);
    }
  }
}
