import type { RoleName } from '@prisma/client';

/** Permiso atómico RBAC — fuente canónica para seed y autorización (GTK-17 / RF-17). */
export type PermissionDefinition = {
  code: string;
  module: 'projects' | 'content' | 'users' | 'ai';
  description: string;
};

/** Rol predefinido con metadatos de UI. */
export type RoleDefinition = {
  name: RoleName;
  label: string;
  description: string;
};

export const PERMISSIONS: readonly PermissionDefinition[] = [
  { code: 'projects.read', module: 'projects', description: 'Consultar proyectos y pipeline' },
  { code: 'projects.create', module: 'projects', description: 'Crear proyectos desde leads' },
  { code: 'projects.update', module: 'projects', description: 'Actualizar ficha de proyecto' },
  { code: 'projects.delete', module: 'projects', description: 'Eliminar proyectos (soft delete)' },
  { code: 'projects.assign', module: 'projects', description: 'Asignar técnico a proyecto' },
  { code: 'content.read', module: 'content', description: 'Consultar contenido editorial' },
  { code: 'content.create', module: 'content', description: 'Crear borradores de contenido' },
  { code: 'content.update', module: 'content', description: 'Editar contenido en revisión' },
  { code: 'content.publish', module: 'content', description: 'Publicar contenido aprobado' },
  { code: 'content.delete', module: 'content', description: 'Despublicar o eliminar contenido' },
  { code: 'ai.read', module: 'ai', description: 'Consultar generaciones y coste IA' },
  { code: 'ai.generate', module: 'ai', description: 'Invocar generación asistida con Claude' },
  { code: 'ai.configure', module: 'ai', description: 'Configurar plantillas y presupuesto IA' },
  { code: 'users.read', module: 'users', description: 'Consultar usuarios del portal' },
  { code: 'users.create', module: 'users', description: 'Dar de alta usuarios internos' },
  { code: 'users.update', module: 'users', description: 'Editar usuarios y roles' },
  { code: 'users.delete', module: 'users', description: 'Desactivar o eliminar usuarios' },
] as const;

export const ROLES: readonly RoleDefinition[] = [
  {
    name: 'admin',
    label: 'Administrador',
    description: 'Acceso total al portal y configuración',
  },
  {
    name: 'gestor',
    label: 'Gestor comercial',
    description: 'Gestión del pipeline comercial y proyectos',
  },
  {
    name: 'editor',
    label: 'Editor de contenido',
    description: 'CMS editorial y generación asistida IA',
  },
  {
    name: 'tecnico',
    label: 'Técnico',
    description: 'Consulta de proyectos asignados',
  },
] as const;

/** Reglas de asignación: admin=todos; gestor=projects.*; editor=content.*+ai.generate; tecnico=projects.read */
export const ROLE_PERMISSION_RULES: Readonly<Record<RoleName, readonly string[]>> = {
  admin: ['*'],
  gestor: ['projects.*'],
  editor: ['content.*', 'ai.generate'],
  tecnico: ['projects.read'],
};

const PERMISSION_CODES = new Set(PERMISSIONS.map((p) => p.code));

function matchesRule(permissionCode: string, rule: string): boolean {
  if (rule === '*') return true;
  if (rule.endsWith('.*')) {
    const prefix = rule.slice(0, -1);
    return permissionCode.startsWith(prefix);
  }
  return permissionCode === rule;
}

/** Resuelve los códigos de permiso efectivos para un rol según la matriz canónica. */
export function resolvePermissionCodesForRole(roleName: RoleName): string[] {
  const rules = ROLE_PERMISSION_RULES[roleName];
  return PERMISSIONS.filter((permission) =>
    rules.some((rule) => matchesRule(permission.code, rule)),
  ).map((permission) => permission.code);
}

/** Valida que la matriz RBAC solo referencia permisos definidos y cumple las reglas del ticket. */
export function assertRbacMatrixIntegrity(): void {
  for (const role of ROLES) {
    const codes = resolvePermissionCodesForRole(role.name);
    if (codes.length === 0) {
      throw new Error(`El rol ${role.name} no tiene permisos asignados`);
    }
    for (const code of codes) {
      if (!PERMISSION_CODES.has(code)) {
        throw new Error(`Permiso desconocido ${code} para rol ${role.name}`);
      }
    }
  }

  const adminCodes = new Set(resolvePermissionCodesForRole('admin'));
  if (adminCodes.size !== PERMISSIONS.length) {
    throw new Error('admin debe tener todos los permisos atómicos');
  }

  const gestorCodes = resolvePermissionCodesForRole('gestor');
  if (!gestorCodes.every((c) => c.startsWith('projects.'))) {
    throw new Error('gestor solo debe tener permisos projects.*');
  }

  const editorCodes = resolvePermissionCodesForRole('editor');
  const editorProjects = editorCodes.filter((c) => c.startsWith('projects.'));
  if (editorProjects.length > 0) {
    throw new Error('editor no debe tener permisos de projects');
  }
  if (!editorCodes.includes('ai.generate')) {
    throw new Error('editor debe incluir ai.generate');
  }

  if (resolvePermissionCodesForRole('tecnico').join(',') !== 'projects.read') {
    throw new Error('tecnico solo debe tener projects.read');
  }
}
