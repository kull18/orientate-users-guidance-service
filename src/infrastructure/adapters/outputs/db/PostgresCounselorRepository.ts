import { Pool } from 'pg';
import { CounselorRepositoryPort } from '../../../../application/ports/outputs/CounselorRepositoryPort';
import { Group } from '../../../../domain/entities/Group';
import { StudentProfile } from '../../../../domain/entities/StudentProfile';
import { Session } from '../../../../domain/entities/Session';
import { Task } from '../../../../domain/entities/Task';
import { Alert } from '../../../../domain/entities/Alert';
import { DatabaseException } from '../../../../domain/exceptions/BusinessException';

export class PostgresCounselorRepository implements CounselorRepositoryPort {
  constructor(private readonly pool: Pool) {}

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

  private mapRowToProfile(row: any): StudentProfile {
    return new StudentProfile({
      id: row.user_id,
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

  async saveGroup(group: Group): Promise<Group> {
    const query = `
      INSERT INTO groups (counselor_id, name, access_code)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    try {
      const result = await this.pool.query(query, [group.counselorId, group.name, group.accessCode]);
      return this.mapRowToGroup(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error saving group: ${error.message}`);
    }
  }

  async findGroupsByCounselorId(counselorId: string): Promise<Group[]> {
    const query = 'SELECT * FROM groups WHERE counselor_id = $1 ORDER BY created_at DESC;';
    try {
      const result = await this.pool.query(query, [counselorId]);
      return result.rows.map((row) => this.mapRowToGroup(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding counselor groups: ${error.message}`);
    }
  }

  async findGroupById(groupId: string): Promise<Group | null> {
    const query = 'SELECT * FROM groups WHERE id = $1;';
    try {
      const result = await this.pool.query(query, [groupId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToGroup(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding group by ID: ${error.message}`);
    }
  }

  async findGroupByAccessCode(accessCode: string): Promise<Group | null> {
    const query = 'SELECT * FROM groups WHERE access_code = $1;';
    try {
      const result = await this.pool.query(query, [accessCode]);
      if (result.rows.length === 0) return null;
      return this.mapRowToGroup(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding group by access code: ${error.message}`);
    }
  }

  async findStudentsByGroupId(groupId: string): Promise<StudentProfile[]> {
    const query = `
      SELECT sp.* 
      FROM student_profiles sp
      JOIN student_group sg ON sp.user_id = sg.user_id
      WHERE sg.group_id = $1
      ORDER BY sp.created_at DESC;
    `;
    try {
      const result = await this.pool.query(query, [groupId]);
      return result.rows.map((row) => this.mapRowToProfile(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding students in group: ${error.message}`);
    }
  }

  async findStudentByUserId(studentId: string): Promise<StudentProfile | null> {
    const query = 'SELECT * FROM student_profiles WHERE user_id = $1;';
    try {
      const result = await this.pool.query(query, [studentId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToProfile(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error finding student profile: ${error.message}`);
    }
  }

  async saveSession(session: Session): Promise<Session> {
    const query = `
      INSERT INTO counselor_sessions (student_id, counselor_id, session_date, motive, observations, agreement, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      session.studentId,
      session.counselorId,
      session.sessionDate,
      session.motive,
      session.observations || null,
      session.agreement || null,
      session.status
    ];
    try {
      const result = await this.pool.query(query, values);
      const row = result.rows[0];
      return new Session({
        id: row.id,
        studentId: row.student_id,
        counselorId: row.counselor_id,
        sessionDate: row.session_date,
        motive: row.motive,
        observations: row.observations,
        agreement: row.agreement,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (error: any) {
      throw new DatabaseException(`Error saving counselor session: ${error.message}`);
    }
  }

  async saveTask(task: Task): Promise<Task> {
    const query = `
      INSERT INTO tasks (title, description, due_date, status, group_id, student_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      task.title,
      task.description || null,
      task.dueDate || null,
      task.status,
      task.groupId || null,
      task.studentId || null
    ];
    try {
      const result = await this.pool.query(query, values);
      const row = result.rows[0];
      return new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        status: row.status,
        groupId: row.group_id,
        studentId: row.student_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (error: any) {
      throw new DatabaseException(`Error saving task: ${error.message}`);
    }
  }

  async findTasksByStudentId(studentId: string): Promise<Task[]> {
    // Fetches individual tasks and tasks assigned to any group the student has joined
    const query = `
      SELECT t.* 
      FROM tasks t
      LEFT JOIN student_group sg ON t.group_id = sg.group_id
      WHERE t.student_id = $1 OR sg.user_id = $1
      ORDER BY t.created_at DESC;
    `;
    try {
      const result = await this.pool.query(query, [studentId]);
      return result.rows.map((row) => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        status: row.status,
        groupId: row.group_id,
        studentId: row.student_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      throw new DatabaseException(`Error finding student tasks: ${error.message}`);
    }
  }

  async findTasksByGroupId(groupId: string): Promise<Task[]> {
    const query = 'SELECT * FROM tasks WHERE group_id = $1 ORDER BY created_at DESC;';
    try {
      const result = await this.pool.query(query, [groupId]);
      return result.rows.map((row) => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        status: row.status,
        groupId: row.group_id,
        studentId: row.student_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      throw new DatabaseException(`Error finding group tasks: ${error.message}`);
    }
  }

  async findSessionsByStudentId(studentId: string): Promise<Session[]> {
    const query = 'SELECT * FROM counselor_sessions WHERE student_id = $1 ORDER BY session_date DESC;';
    try {
      const result = await this.pool.query(query, [studentId]);
      return result.rows.map((row) => new Session({
        id: row.id,
        studentId: row.student_id,
        counselorId: row.counselor_id,
        sessionDate: row.session_date,
        motive: row.motive,
        observations: row.observations,
        agreement: row.agreement,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      throw new DatabaseException(`Error finding student sessions: ${error.message}`);
    }
  }

  async findAlertsByStudentId(studentId: string): Promise<Alert[]> {
    const query = 'SELECT * FROM alerts WHERE student_id = $1 ORDER BY created_at DESC;';
    try {
      const result = await this.pool.query(query, [studentId]);
      return result.rows.map((row) => new Alert({
        id: row.id,
        studentId: row.student_id,
        groupId: row.group_id,
        alertType: row.alert_type,
        status: row.status,
        details: row.details,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      throw new DatabaseException(`Error finding student alerts: ${error.message}`);
    }
  }

  async isStudentAssociatedWithCounselor(studentId: string, counselorId: string): Promise<boolean> {
    // 1. Is student in a group owned by the counselor?
    const groupQuery = `
      SELECT COUNT(1) 
      FROM student_group sg
      JOIN groups g ON sg.group_id = g.id
      WHERE sg.user_id = $1 AND g.counselor_id = $2;
    `;
    // 2. Does a session exist between counselor and student?
    const sessionQuery = `
      SELECT COUNT(1) 
      FROM counselor_sessions 
      WHERE student_id = $1 AND counselor_id = $2;
    `;

    try {
      const [groupResult, sessionResult] = await Promise.all([
        this.pool.query(groupQuery, [studentId, counselorId]),
        this.pool.query(sessionQuery, [studentId, counselorId])
      ]);

      const groupCount = parseInt(groupResult.rows[0].count, 10);
      const sessionCount = parseInt(sessionResult.rows[0].count, 10);

      return (groupCount > 0 || sessionCount > 0);
    } catch (error: any) {
      throw new DatabaseException(`Error verifying student-counselor association: ${error.message}`);
    }
  }

  async findStudentsByCounselorId(counselorId: string): Promise<StudentProfile[]> {
    const query = `
      SELECT DISTINCT sp.* 
      FROM student_profiles sp
      JOIN student_group sg ON sp.user_id = sg.user_id
      JOIN groups g ON sg.group_id = g.id
      WHERE g.counselor_id = $1
      ORDER BY sp.created_at DESC;
    `;
    try {
      const result = await this.pool.query(query, [counselorId]);
      return result.rows.map((row) => this.mapRowToProfile(row));
    } catch (error: any) {
      throw new DatabaseException(`Error finding counselor students: ${error.message}`);
    }
  }

  async updateGroup(group: Group): Promise<Group> {
    const query = `
      UPDATE groups 
      SET name = $1, access_code = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    try {
      const result = await this.pool.query(query, [group.name, group.accessCode, group.id]);
      if (result.rows.length === 0) {
        throw new DatabaseException(`Group not found to update with ID ${group.id}`);
      }
      return this.mapRowToGroup(result.rows[0]);
    } catch (error: any) {
      throw new DatabaseException(`Error updating group: ${error.message}`);
    }
  }
}
