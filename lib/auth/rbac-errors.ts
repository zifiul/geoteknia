export class ForbiddenError extends Error {
  constructor(message = 'No tiene permiso para realizar esta acción') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
