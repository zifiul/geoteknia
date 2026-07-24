export class ProjectNotFoundError extends Error {
  constructor() {
    super('Proyecto no encontrado');
    this.name = 'ProjectNotFoundError';
  }
}
