import { AuditAction } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  isSensitiveMetadataKey,
  sanitizeAuditMetadata,
} from '@/lib/audit/sanitize';
import { isMustAuditAction, MUST_AUDIT_ACTIONS } from '@/lib/audit/actions';
import { extractRequestAuditContext } from '@/lib/audit/request-context';

describe('lib/audit/sanitize — GTK-22', () => {
  it('conserva event en role_change para sub-eventos 2FA (GTK-24)', () => {
    const result = sanitizeAuditMetadata(AuditAction.role_change, {
      targetUserId: '11111111-1111-4111-8111-111111111111',
      event: '2fa_enabled',
    });

    expect(result).toEqual({
      targetUserId: '11111111-1111-4111-8111-111111111111',
      event: '2fa_enabled',
    });
  });

  it('conserva solo claves en whitelist por acción', () => {
    const result = sanitizeAuditMetadata(AuditAction.role_change, {
      targetUserId: '11111111-1111-4111-8111-111111111111',
      previousRole: 'editor',
      newRole: 'admin',
      email: 'should-be-stripped',
      unrelatedField: 'ignored',
    });

    expect(result).toEqual({
      targetUserId: '11111111-1111-4111-8111-111111111111',
      previousRole: 'editor',
      newRole: 'admin',
    });
  });

  it('detecta claves sensibles', () => {
    expect(isSensitiveMetadataKey('password')).toBe(true);
    expect(isSensitiveMetadataKey('totpSecret')).toBe(true);
    expect(isSensitiveMetadataKey('entitySlug')).toBe(false);
  });

  it('en diffs anidados conserva solo identificadores', () => {
    const result = sanitizeAuditMetadata(AuditAction.export, {
      exportType: 'leads_csv',
      recordCount: 42,
      filterIds: [{ id: 'aaa', email: 'hidden@example.com', leadId: 'bbb' }],
    });

    expect(result).toEqual({
      exportType: 'leads_csv',
      recordCount: 42,
      filterIds: [{ id: 'aaa', leadId: 'bbb' }],
    });
  });
});

describe('lib/audit/actions — política mustAudit', () => {
  it('marca delete, publish, approve y role_change como mustAudit', () => {
    expect(MUST_AUDIT_ACTIONS.has(AuditAction.delete)).toBe(true);
    expect(MUST_AUDIT_ACTIONS.has(AuditAction.publish)).toBe(true);
    expect(MUST_AUDIT_ACTIONS.has(AuditAction.approve)).toBe(true);
    expect(MUST_AUDIT_ACTIONS.has(AuditAction.role_change)).toBe(true);
    expect(isMustAuditAction(AuditAction.login)).toBe(false);
  });
});

describe('lib/audit/request-context — extractRequestAuditContext', () => {
  it('extrae la primera IP de x-forwarded-for y user-agent', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      'user-agent': 'Mozilla/5.0 Test',
    });

    expect(extractRequestAuditContext(headers)).toEqual({
      ip: '203.0.113.1',
      userAgent: 'Mozilla/5.0 Test',
    });
  });

  it('retorna null cuando no hay headers de contexto', () => {
    expect(extractRequestAuditContext(new Headers())).toEqual({
      ip: null,
      userAgent: null,
    });
  });
});
