export class ProjectNotFoundError extends Error {
  constructor() {
    super('Proyecto no encontrado');
    this.name = 'ProjectNotFoundError';
  }
}

export class InvalidTransitionError extends Error {
  constructor() {
    super('Transición de estado no permitida');
    this.name = 'InvalidTransitionError';
  }
}

export class ProjectValidationError extends Error {
  constructor(message = 'Datos de proyecto no válidos') {
    super(message);
    this.name = 'ProjectValidationError';
  }
}
