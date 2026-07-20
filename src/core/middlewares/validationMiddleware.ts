import { Request, Response, NextFunction } from 'express';
import { ValidationException } from '../../domain/exceptions/BusinessException';

// Helper to validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUUID = (val: any): boolean => typeof val === 'string' && uuidRegex.test(val);

// Helper to validate date string
const isDate = (val: any): boolean => typeof val === 'string' && !isNaN(Date.parse(val));

// 1. Validate Student Profile Creation (POST /profile)
export const validateCreateStudentProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { subjectsLiked, subjectsDisliked, interests, skills, needsScholarship, studyAbroad, vocationalClarity } = req.body;

  if (!Array.isArray(subjectsLiked) || !subjectsLiked.every(s => typeof s === 'string')) {
    throw new ValidationException('subjectsLiked debe ser un arreglo de cadenas de texto.');
  }

  if (!Array.isArray(subjectsDisliked) || !subjectsDisliked.every(s => typeof s === 'string')) {
    throw new ValidationException('subjectsDisliked debe ser un arreglo de cadenas de texto.');
  }

  if (!Array.isArray(interests) || !interests.every(s => typeof s === 'string')) {
    throw new ValidationException('interests debe ser un arreglo de cadenas de texto.');
  }

  if (!Array.isArray(skills) || !skills.every(s => typeof s === 'string')) {
    throw new ValidationException('skills debe ser un arreglo de cadenas de texto.');
  }

  if (typeof needsScholarship !== 'boolean') {
    throw new ValidationException('needsScholarship debe ser un valor booleano.');
  }

  if (typeof studyAbroad !== 'boolean') {
    throw new ValidationException('studyAbroad debe ser un valor booleano.');
  }

  if (typeof vocationalClarity !== 'number' || vocationalClarity < 1 || vocationalClarity > 10) {
    throw new ValidationException('vocationalClarity debe ser un número entero entre 1 y 10.');
  }

  // Sanitize strings
  req.body.subjectsLiked = subjectsLiked.map(s => s.trim());
  req.body.subjectsDisliked = subjectsDisliked.map(s => s.trim());
  req.body.interests = interests.map(s => s.trim());
  req.body.skills = skills.map(s => s.trim());

  next();
};

// 2. Validate Student Profile Update (PATCH /profile)
export const validateUpdateStudentProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { subjectsLiked, subjectsDisliked, interests, skills, needsScholarship, studyAbroad, vocationalClarity } = req.body;

  if (subjectsLiked !== undefined) {
    if (!Array.isArray(subjectsLiked) || !subjectsLiked.every(s => typeof s === 'string')) {
      throw new ValidationException('subjectsLiked debe ser un arreglo de cadenas de texto.');
    }
    req.body.subjectsLiked = subjectsLiked.map(s => s.trim());
  }

  if (subjectsDisliked !== undefined) {
    if (!Array.isArray(subjectsDisliked) || !subjectsDisliked.every(s => typeof s === 'string')) {
      throw new ValidationException('subjectsDisliked debe ser un arreglo de cadenas de texto.');
    }
    req.body.subjectsDisliked = subjectsDisliked.map(s => s.trim());
  }

  if (interests !== undefined) {
    if (!Array.isArray(interests) || !interests.every(s => typeof s === 'string')) {
      throw new ValidationException('interests debe ser un arreglo de cadenas de texto.');
    }
    req.body.interests = interests.map(s => s.trim());
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every(s => typeof s === 'string')) {
      throw new ValidationException('skills debe ser un arreglo de cadenas de texto.');
    }
    req.body.skills = skills.map(s => s.trim());
  }

  if (needsScholarship !== undefined && typeof needsScholarship !== 'boolean') {
    throw new ValidationException('needsScholarship debe ser un valor booleano.');
  }

  if (studyAbroad !== undefined && typeof studyAbroad !== 'boolean') {
    throw new ValidationException('studyAbroad debe ser un valor booleano.');
  }

  if (vocationalClarity !== undefined) {
    if (typeof vocationalClarity !== 'number' || vocationalClarity < 1 || vocationalClarity > 10) {
      throw new ValidationException('vocationalClarity debe ser un número entero entre 1 y 10.');
    }
  }

  next();
};

// 3. Validate Joining Group (POST /join-group)
export const validateJoinGroup = (req: Request, res: Response, next: NextFunction): void => {
  const { accessCode } = req.body;

  if (typeof accessCode !== 'string' || accessCode.trim() === '') {
    throw new ValidationException('El código de acceso (accessCode) es requerido y debe ser texto.');
  }

  req.body.accessCode = accessCode.trim();
  next();
};

// 4. Validate Group Creation (POST /groups)
export const validateCreateGroup = (req: Request, res: Response, next: NextFunction): void => {
  const { name, accessCode } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationException('El nombre del grupo (name) es requerido y debe ser texto.');
  }

  if (accessCode !== undefined && accessCode !== null) {
    if (typeof accessCode !== 'string' || accessCode.trim() === '') {
      throw new ValidationException('El código de acceso (accessCode) debe ser un texto no vacío.');
    }
    req.body.accessCode = accessCode.trim();
  }

  req.body.name = name.trim();
  next();
};

// Validate Group Update (PUT /groups/:groupId)
export const validateUpdateGroup = (req: Request, res: Response, next: NextFunction): void => {
  const { groupId } = req.params;
  const { name, accessCode } = req.body;

  if (!isUUID(groupId)) {
    throw new ValidationException('El ID del grupo (groupId) debe ser un UUID válido.');
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ValidationException('El nombre del grupo (name) debe ser un texto no vacío.');
    }
    req.body.name = name.trim();
  }

  if (accessCode !== undefined) {
    if (typeof accessCode !== 'string' || accessCode.trim() === '') {
      throw new ValidationException('El código de acceso (accessCode) debe ser un texto no vacío.');
    }
    req.body.accessCode = accessCode.trim();
  }

  next();
};

// 5. Validate Session Creation (POST /students/:studentId/sessions)
export const validateCreateSession = (req: Request, res: Response, next: NextFunction): void => {
  const { studentId } = req.params;
  const { sessionDate, motive, observations, agreement, status } = req.body;

  if (!isUUID(studentId)) {
    throw new ValidationException('El studentId en los parámetros debe ser un UUID válido.');
  }

  if (!isDate(sessionDate)) {
    throw new ValidationException('sessionDate es requerido y debe ser una fecha válida.');
  }

  if (typeof motive !== 'string' || motive.trim() === '') {
    throw new ValidationException('El motivo (motive) es requerido y debe ser texto.');
  }

  if (observations !== undefined && typeof observations !== 'string') {
    throw new ValidationException('observations debe ser texto.');
  }

  if (agreement !== undefined && typeof agreement !== 'string') {
    throw new ValidationException('agreement debe ser texto.');
  }

  if (status !== undefined) {
    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationException(`status debe ser uno de los siguientes: ${validStatuses.join(', ')}.`);
    }
  }

  req.body.motive = motive.trim();
  if (observations !== undefined) req.body.observations = observations.trim();
  if (agreement !== undefined) req.body.agreement = agreement.trim();

  next();
};

// 6. Validate Task Assignment (POST /tasks)
export const validateAssignTask = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, dueDate, status, groupId, studentId } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new ValidationException('El título (title) es requerido y debe ser texto.');
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new ValidationException('description debe ser texto.');
  }

  if (dueDate !== undefined && !isDate(dueDate)) {
    throw new ValidationException('dueDate debe ser una fecha válida.');
  }

  if (status !== undefined) {
    const validStatuses = ['PENDING', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationException(`status debe ser uno de los siguientes: ${validStatuses.join(', ')}.`);
    }
  }

  if (!groupId && !studentId) {
    throw new ValidationException('La tarea debe ser asignada a un grupo (groupId) o a un estudiante (studentId).');
  }

  if (groupId !== undefined && groupId !== null) {
    if (!isUUID(groupId)) {
      throw new ValidationException('groupId debe ser un UUID válido.');
    }
  }

  if (studentId !== undefined && studentId !== null) {
    if (!isUUID(studentId)) {
      throw new ValidationException('studentId debe ser un UUID válido.');
    }
  }

  req.body.title = title.trim();
  if (description !== undefined) req.body.description = description.trim();

  next();
};

// 7. Validate UUID format in URL path parameters
export const validateUuidParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!isUUID(value)) {
      throw new ValidationException(`El parámetro ${paramName} debe ser un UUID válido.`);
    }
    next();
  };
};

// 8. Validate Alumni Profile (PUT /alumni/profile)
export const validateUpdateAlumniProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, careerId, universityId, currentJob, company, graduationYear, experienceSummary, linkedinUrl } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    throw new ValidationException('El nombre (name) debe ser texto no vacío.');
  }

  if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
    throw new ValidationException('El correo (email) debe ser texto no vacío.');
  }

  if (!isUUID(careerId)) {
    throw new ValidationException('careerId es requerido y debe ser un UUID válido.');
  }

  if (!isUUID(universityId)) {
    throw new ValidationException('universityId es requerido y debe ser un UUID válido.');
  }

  if (typeof currentJob !== 'string' || currentJob.trim() === '') {
    throw new ValidationException('El puesto actual (currentJob) es requerido y debe ser texto.');
  }

  if (typeof company !== 'string' || company.trim() === '') {
    throw new ValidationException('La empresa (company) es requerida y debe ser texto.');
  }

  if (typeof graduationYear !== 'number' || graduationYear < 1900 || graduationYear > 2100) {
    throw new ValidationException('El año de graduación (graduationYear) es requerido y debe ser un año válido.');
  }

  if (experienceSummary !== undefined && typeof experienceSummary !== 'string') {
    throw new ValidationException('experienceSummary debe ser texto.');
  }

  if (linkedinUrl !== undefined && typeof linkedinUrl !== 'string') {
    throw new ValidationException('linkedinUrl debe ser texto.');
  }

  if (name !== undefined) req.body.name = name.trim();
  if (email !== undefined) req.body.email = email.trim();
  req.body.currentJob = currentJob.trim();
  req.body.company = company.trim();
  if (experienceSummary !== undefined) req.body.experienceSummary = experienceSummary.trim();
  if (linkedinUrl !== undefined) req.body.linkedinUrl = linkedinUrl.trim();

  next();
};

// 9. Validate Success Story (POST /alumni/stories)
export const validateShareSuccessStory = (req: Request, res: Response, next: NextFunction): void => {
  const { title, content } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new ValidationException('El título (title) es requerido y debe ser texto.');
  }

  if (typeof content !== 'string' || content.trim() === '') {
    throw new ValidationException('El contenido (content) es requerido y debe ser texto.');
  }

  req.body.title = title.trim();
  req.body.content = content.trim();

  next();
};


