import { describe, expect, it } from 'vitest';

import {
  parseAuditEntityKey,
  parseAuditFiltersFromSearchParams,
} from '@/lib/admin/audit-filters-schema';
import { AUDIT_SYSTEM_ACTOR_ID } from '@/lib/admin/audit-labels';

describe('parseAuditFiltersFromSearchParams', () => {
  it('parsea entityKey en entityType y entityId', () => {
    const result = parseAuditFiltersFromSearchParams({
      entityKey: 'projects:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filters.entityType).toBe('projects');
      expect(result.filters.entityId).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    }
  });

  it('acepta actor Sistema', () => {
    const result = parseAuditFiltersFromSearchParams({
      userId: AUDIT_SYSTEM_ACTOR_ID,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filters.userId).toBe(AUDIT_SYSTEM_ACTOR_ID);
    }
  });

  it('no valida cuando los desplegables están vacíos', () => {
    const result = parseAuditFiltersFromSearchParams({
      action: '',
      userId: '',
      entityKey: '',
      from: '',
      to: '',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filters.action).toBeUndefined();
      expect(result.filters.userId).toBeUndefined();
      expect(result.filters.entityType).toBeUndefined();
      expect(result.filters.entityId).toBeUndefined();
      expect(result.filters.from).toBeUndefined();
      expect(result.filters.to).toBeUndefined();
    }
  });

  it('no valida cuando faltan parámetros opcionales', () => {
    const result = parseAuditFiltersFromSearchParams({});

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filters.page).toBe(1);
      expect(result.filters.pageSize).toBe(25);
    }
  });

  it('parsea fechas válidas', () => {
    const result = parseAuditFiltersFromSearchParams({
      from: '2026-01-15',
      to: '2026-02-01',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filters.from).toBeInstanceOf(Date);
      expect(result.filters.to).toBeInstanceOf(Date);
    }
  });

  it('devuelve errores en español para acción inválida', () => {
    const result = parseAuditFiltersFromSearchParams({
      action: 'no_existe',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.some((msg) => msg.includes('Acción'))).toBe(true);
      expect(result.fieldErrors.join(' ')).not.toMatch(/Too small|expected date/i);
    }
  });

  it('devuelve error en español si la fecha final es anterior a la inicial', () => {
    const result = parseAuditFiltersFromSearchParams({
      from: '2026-03-01',
      to: '2026-01-01',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors).toContain(
        'Hasta: La fecha inicial debe ser anterior o igual a la final',
      );
    }
  });
});

describe('parseAuditEntityKey', () => {
  it('devuelve vacío con formato inválido', () => {
    expect(parseAuditEntityKey('sin-separador')).toEqual({});
    expect(parseAuditEntityKey('projects:not-a-uuid')).toEqual({});
    expect(parseAuditEntityKey('')).toEqual({});
  });
});
