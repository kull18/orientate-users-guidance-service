export abstract class BusinessException extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundException extends BusinessException {
  public readonly statusCode = 404;
}

export class DuplicateEntityException extends BusinessException {
  public readonly statusCode = 409;
}

export class ValidationException extends BusinessException {
  public readonly statusCode = 400;
}

export class UnauthorizedActionException extends BusinessException {
  public readonly statusCode = 403;
}

export class DatabaseException extends BusinessException {
  public readonly statusCode = 500;
}
