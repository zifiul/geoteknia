export class ContentNotFoundError extends Error {
  constructor(message = 'Contenido no encontrado') {
    super(message);
    this.name = 'ContentNotFoundError';
  }
}

export class ContentConflictError extends Error {
  constructor(message = 'Conflicto de contenido') {
    super(message);
    this.name = 'ContentConflictError';
  }
}

export class ContentValidationError extends Error {
  constructor(message = 'Datos de contenido no válidos') {
    super(message);
    this.name = 'ContentValidationError';
  }
}
