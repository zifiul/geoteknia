/**
 * Tests GTK-37 — presupuesto IA, guardarraíl y alertas.
 */
import { AiModel, PromptPageType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const aggregate = vi.fn();
const findFirstBudget = vi.fn();
const findUniqueAlert = vi.fn();
const createAlert = vi.fn();
const budgetUpdate = vi.fn();
const budgetCreate = vi.fn();
const transaction = vi.fn();
const findFirstExisting = vi.fn();
const sendEmail = vi.fn();
const recordAudit = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    aiTokenUsage: { aggregate },
    aiBudgetConfig: {
      findFirst: findFirstBudget,
      update: budgetUpdate,
      create: budgetCreate,
    },
    aiBudgetAlert: {
      findUnique: findUniqueAlert,
      create: createAlert,
    },
    $transaction: transaction,
  },
}));

vi.mock('@/lib/email', () => ({
  sendEmail,
}));

vi.mock('@/lib/ia/emails/budget-alert-email', () => ({
  BudgetAlertEmail: () => null,
  buildBudgetAlertSubject: (period: string) => `Alert ${period}`,
}));

describe('lib/ia/budget', () => {
  beforeEach(() => {
    vi.resetModules();
    aggregate.mockReset();
    findFirstBudget.mockReset();
    findUniqueAlert.mockReset();
    createAlert.mockReset();
    sendEmail.mockReset();
    recordAudit.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getCurrentSpend suma solo el periodo indicado', async () => {
    aggregate.mockResolvedValue({
      _sum: { costEur: new Prisma.Decimal('42.5') },
    });

    const { getCurrentSpend } = await import('@/lib/ia/budget');
    const total = await getCurrentSpend('2026-07');

    expect(total).toBe(42.5);
    expect(aggregate).toHaveBeenCalledWith({
      where: { billingPeriod: '2026-07' },
      _sum: { costEur: true },
    });
  });

  it('getActiveBudget prefiere override de periodo sobre global', async () => {
    findFirstBudget
      .mockResolvedValueOnce({
        billingPeriod: '2026-08',
        monthlyBudgetEur: new Prisma.Decimal('200'),
        alertThresholdPct: 70,
        modelByPageType: null,
        notifyEmails: null,
        isActive: true,
      })
      .mockResolvedValueOnce(null);

    const { getActiveBudget } = await import('@/lib/ia/budget');
    const config = await getActiveBudget('2026-08');

    expect(config?.monthlyBudgetEur).toBe(200);
    expect(findFirstBudget).toHaveBeenCalledTimes(1);
  });

  it('assertWithinBudget lanza cuando el gasto alcanza el tope', async () => {
    findFirstBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        billingPeriod: null,
        monthlyBudgetEur: new Prisma.Decimal('100'),
        alertThresholdPct: 80,
        modelByPageType: null,
        notifyEmails: null,
        isActive: true,
      });
    aggregate.mockResolvedValue({
      _sum: { costEur: new Prisma.Decimal('100') },
    });

    const { assertWithinBudget } = await import('@/lib/ia/budget');
    const { BudgetExceededError } = await import('@/lib/ia/errors');

    await expect(assertWithinBudget('2026-07')).rejects.toBeInstanceOf(
      BudgetExceededError,
    );
  });

  it('assertWithinBudget permite por debajo del tope', async () => {
    findFirstBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        billingPeriod: null,
        monthlyBudgetEur: new Prisma.Decimal('100'),
        alertThresholdPct: 80,
        modelByPageType: null,
        notifyEmails: null,
        isActive: true,
      });
    aggregate.mockResolvedValue({
      _sum: { costEur: new Prisma.Decimal('50') },
    });

    const { assertWithinBudget } = await import('@/lib/ia/budget');
    await expect(assertWithinBudget('2026-07')).resolves.toBeUndefined();
  });

  it('assertWithinBudget fail-open sin configuración', async () => {
    findFirstBudget.mockResolvedValue(null);

    const { assertWithinBudget } = await import('@/lib/ia/budget');
    await expect(assertWithinBudget('2026-07')).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('checkThresholdAndNotify envía alerta una sola vez por periodo', async () => {
    findFirstBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        billingPeriod: null,
        monthlyBudgetEur: new Prisma.Decimal('100'),
        alertThresholdPct: 80,
        modelByPageType: null,
        notifyEmails: ['ops@geoteknia.local'],
        isActive: true,
      });
    aggregate.mockResolvedValue({
      _sum: { costEur: new Prisma.Decimal('85') },
    });
    findUniqueAlert.mockResolvedValue(null);
    createAlert.mockResolvedValue({ billingPeriod: '2026-07' });
    sendEmail.mockResolvedValue({ ok: true, id: 'email-1' });

    const { checkThresholdAndNotify } = await import('@/lib/ia/budget');

    await checkThresholdAndNotify('2026-07');
    findFirstBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        billingPeriod: null,
        monthlyBudgetEur: new Prisma.Decimal('100'),
        alertThresholdPct: 80,
        modelByPageType: null,
        notifyEmails: ['ops@geoteknia.local'],
        isActive: true,
      });
    findUniqueAlert.mockResolvedValue({ billingPeriod: '2026-07' });
    await checkThresholdAndNotify('2026-07');

    expect(createAlert).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('checkThresholdAndNotify no reenvía si ya existe marcador durable', async () => {
    findFirstBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        billingPeriod: null,
        monthlyBudgetEur: new Prisma.Decimal('100'),
        alertThresholdPct: 80,
        modelByPageType: null,
        notifyEmails: ['ops@geoteknia.local'],
        isActive: true,
      });
    aggregate.mockResolvedValue({
      _sum: { costEur: new Prisma.Decimal('90') },
    });
    findUniqueAlert.mockResolvedValue({ billingPeriod: '2026-07' });

    const { checkThresholdAndNotify } = await import('@/lib/ia/budget');
    await checkThresholdAndNotify('2026-07');

    expect(createAlert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('lib/ia/budget-config-schema', () => {
  it('valida modelByPageType contra PromptPageType y AiModel', async () => {
    const { updateBudgetConfigSchema } = await import('@/lib/ia/budget-config-schema');

    const valid = updateBudgetConfigSchema.safeParse({
      monthlyBudgetEur: 250,
      alertThresholdPct: 75,
      modelByPageType: {
        [PromptPageType.service]: AiModel.claude_sonnet_4_6,
      },
    });
    expect(valid.success).toBe(true);

    const invalid = updateBudgetConfigSchema.safeParse({
      monthlyBudgetEur: 250,
      alertThresholdPct: 75,
      modelByPageType: {
        invalid_page: AiModel.claude_sonnet_4_6,
      },
    });
    expect(invalid.success).toBe(false);
  });
});

describe('currentBillingPeriodUtc', () => {
  it('formatea mes UTC YYYY-MM', async () => {
    const { currentBillingPeriodUtc } = await import('@/lib/ia/budget');
    expect(
      currentBillingPeriodUtc(new Date('2026-07-15T12:00:00.000Z')),
    ).toBe('2026-07');
  });
});
