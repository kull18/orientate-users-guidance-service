import { Pool } from 'pg';
import { AlumniRepositoryPort } from '../../../../application/ports/outputs/AlumniRepositoryPort';
import { AlumniProfile } from '../../../../domain/entities/AlumniProfile';
import { SuccessStory } from '../../../../domain/entities/SuccessStory';
import { DatabaseException } from '../../../../domain/exceptions/BusinessException';

export class PostgresAlumniRepository implements AlumniRepositoryPort {
  constructor(private readonly pool: Pool) {}

  private mapRowToProfile(row: any): AlumniProfile {
    return new AlumniProfile({
      userId: row.user_id,
      name: row.name,
      email: row.email,
      careerId: row.career_id,
      universityId: row.university_id,
      currentJob: row.current_job,
      company: row.company,
      graduationYear: row.graduation_year,
      experienceSummary: row.experience_summary,
      linkedinUrl: row.linkedin_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  private mapRowToStory(row: any): SuccessStory {
    // If the query performs a JOIN to get the alumnus name, it will be in row.alumni_name
    return new SuccessStory({
      id: row.id,
      alumniId: row.alumni_id,
      title: row.title,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  // To support returning custom story view objects containing the alumniName (as Flutter expects)
  private mapRowToStoryWithAlumniName(row: any): any {
    return {
      id: row.id,
      alumniId: row.alumni_id,
      alumniName: row.alumni_name || 'Egresado Anónimo',
      title: row.title,
      story: row.content, // Maps content to story for Flutter frontend compatibility
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async saveProfile(profile: AlumniProfile): Promise<AlumniProfile> {
    const query = `
      INSERT INTO alumni_profiles (user_id, name, email, career_id, university_id, current_job, company, graduation_year, experience_summary, linkedin_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      profile.userId,
      profile.name || null,
      profile.email || null,
      profile.careerId,
      profile.universityId,
      profile.currentJob,
      profile.company,
      profile.graduationYear,
      profile.experienceSummary || null,
      profile.linkedinUrl || null
    ];
    try {
      const result = await this.pool.query(query, values);
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error saving alumni profile: ${error.message}`);
    }
  }

  async findProfileByUserId(userId: string): Promise<AlumniProfile | null> {
    const query = 'SELECT * FROM alumni_profiles WHERE user_id = $1;';
    try {
      const result = await this.pool.query(query, [userId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding alumni profile by user ID: ${error.message}`);
    }
  }

  async updateProfile(profile: AlumniProfile): Promise<AlumniProfile> {
    const query = `
      UPDATE alumni_profiles 
      SET name = COALESCE($1, name), email = COALESCE($2, email), career_id = $3, university_id = $4, current_job = $5, company = $6, graduation_year = $7, experience_summary = $8, linkedin_url = $9, updated_at = NOW()
      WHERE user_id = $10
      RETURNING *;
    `;
    const values = [
      profile.name || null,
      profile.email || null,
      profile.careerId,
      profile.universityId,
      profile.currentJob,
      profile.company,
      profile.graduationYear,
      profile.experienceSummary || null,
      profile.linkedinUrl || null,
      profile.userId
    ];
    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new DatabaseException(`Alumni profile not found to update for user ID ${profile.userId}`);
      }
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error updating alumni profile: ${error.message}`);
    }
  }

  async saveStory(story: SuccessStory): Promise<SuccessStory> {
    const query = `
      INSERT INTO success_stories (alumni_id, title, content, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      story.alumniId,
      story.title,
      story.content,
      story.status
    ];
    try {
      const result = await this.pool.query(query, values);
      return this.mapRowToStory(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error saving success story: ${error.message}`);
    }
  }

  async findStoryById(storyId: string): Promise<SuccessStory | null> {
    const query = 'SELECT * FROM success_stories WHERE id = $1;';
    try {
      const result = await this.pool.query(query, [storyId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToStory(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding success story by ID: ${error.message}`);
    }
  }

  async findStoriesByAlumniId(alumniId: string): Promise<SuccessStory[]> {
    const query = `
      SELECT s.*, p.name as alumni_name 
      FROM success_stories s
      LEFT JOIN alumni_profiles p ON s.alumni_id = p.user_id
      WHERE s.alumni_id = $1 
      ORDER BY s.created_at DESC;
    `;
    try {
      const result = await this.pool.query(query, [alumniId]);
      // Return objects matching Flutter's expectations
      return result.rows.map((row) => this.mapRowToStoryWithAlumniName(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding success stories by alumni: ${error.message}`);
    }
  }

  async findAllApprovedStories(careerId?: string): Promise<SuccessStory[]> {
    let query = `
      SELECT s.*, p.name as alumni_name 
      FROM success_stories s
      JOIN alumni_profiles p ON s.alumni_id = p.user_id
      WHERE s.status = 'APPROVED'
    `;
    const values: any[] = [];
    if (careerId) {
      query += ' AND p.career_id = $1 ORDER BY s.created_at DESC;';
      values.push(careerId);
    } else {
      query += ' ORDER BY s.created_at DESC;';
    }
    try {
      const result = await this.pool.query(query, values);
      return result.rows.map((row) => this.mapRowToStoryWithAlumniName(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding approved success stories: ${error.message}`);
    }
  }

  async findPendingStories(): Promise<SuccessStory[]> {
    const query = `
      SELECT s.*, p.name as alumni_name 
      FROM success_stories s
      LEFT JOIN alumni_profiles p ON s.alumni_id = p.user_id
      WHERE s.status = 'PENDING' 
      ORDER BY s.created_at DESC;
    `;
    try {
      const result = await this.pool.query(query);
      return result.rows.map((row) => this.mapRowToStoryWithAlumniName(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding pending success stories: ${error.message}`);
    }
  }

  async updateStoryStatus(storyId: string, status: string): Promise<void> {
    const query = 'UPDATE success_stories SET status = $1, updated_at = NOW() WHERE id = $2;';
    try {
      const result = await this.pool.query(query, [status, storyId]);
      if (result.rowCount === 0) {
        throw new DatabaseException(`Success story not found with ID ${storyId}`);
      }
    } catch (error: any) {
      throw new DatabaseException(`Error updating success story status: ${error.message}`);
    }
  }

  async findProfilesByUniversityId(universityId: string): Promise<AlumniProfile[]> {
    const query = 'SELECT * FROM alumni_profiles WHERE university_id = $1 OR user_id = $1 ORDER BY created_at DESC;';
    try {
      const result = await this.pool.query(query, [universityId]);
      return result.rows.map((row) => this.mapRowToProfile(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding alumni profiles by university ID: ${error.message}`);
    }
  }

  async deleteProfileByUserId(userId: string): Promise<void> {
    const query = 'DELETE FROM alumni_profiles WHERE user_id = $1;';
    try {
      await this.pool.query(query, [userId]);
    } catch (error: any) {
      throw new DatabaseException(`Error deleting alumni profile: ${error.message}`);
    }
  }
}
