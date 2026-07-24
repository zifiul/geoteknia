import 'server-only';

import { AuditAction, type AiBudgetConfig, Prisma } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

import type { UpdateBudgetConfigInput } from './budget-config-schema';
import { BudgetExceededError } from './errors';

export type BudgetConfigSnapshot = {
  billingPeriod: string | null;
  monthlyBudgetEur: number;
  alertThresholdPct: number;
  modelByPageType: Record<string, string> | null;
  notifyEmails: string[] | null;
  isActive: boolean;
};

export function currentBillingPeriodUtc(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

function mapConfig(row: AiBudgetConfig): BudgetConfigSnapshot {
  const notifyRaw = row.notifyEmails;
  const notifyEmails = Array.isArray(notifyRaw)
    ? notifyRaw.filter((e): e is string => typeof e === 'string')
    : null;

  const modelRaw = row.modelByPageType;
  const modelByPageType =
    modelRaw !== null && typeof modelRaw === 'object' && !Array.isArray(modelRaw)
      ? (modelRaw as Record<string, string>)
      : null;

  return {
    billingPeriod: row.billingPeriod,
    monthlyBudgetEur: toNumber(row.monthlyBudgetEur),
    alertThresholdPct: row.alertThresholdPct,
    modelByPageType,
    notifyEmails,
    isActive: row.isActive,
  };
}

export async function getCurrentSpend(period: string): Promise<number> {
  const result = await db.aiTokenUsage.aggregate({
    where: { billingPeriod: period },
    _sum: { costEur: true },
  });
  const sum = result._sum.costEur;
  return sum === null ? 0 : toNumber(sum);
}

export async function getActiveBudget(period: string): Promise<BudgetConfigSnapshot | null> {
  const periodRow = await db.aiBudgetConfig.findFirst({
    where: {
      billingPeriod: period,
      isActive: true,
      deletedAt: null,
    },
  });
  if (periodRow) {
    return mapConfig(periodRow);
  }

  const globalRow = await db.aiBudgetConfig.findFirst({
    where: {
      billingPeriod: null,
      isActive: true,
      deletedAt: null,
    },
  });
  return globalRow ? mapConfig(globalRow) : null;
}

export async function assertWithinBudget(period?: string): Promise<void> {
  const billingPeriod = period ?? currentBillingPeriodUtc();
  const config = await getActiveBudget(billingPeriod);

  if (!config) {
    console.warn(
      JSON.stringify({
        event: 'ai_budget_guard_skip',
        reason: 'no_active_config',
        billingPeriod,
      }),
    );
    return;
  }

  const spend = await getCurrentSpend(billingPeriod);
  if (spend >= config.monthlyBudgetEur) {
    console.warn(
      JSON.stringify({
        event: 'ai_budget_exceeded',
        billingPeriod,
        spendEur: spend,
        budgetEur: config.monthlyBudgetEur,
      }),
    );
    throw new BudgetExceededError();
  }
}

async function hasAlertBeenSent(period: string): Promise<boolean> {
  const row = await db.aiBudgetAlert.findUnique({
    where: { billingPeriod: period },
  });
  return row !== null;
}

async function markAlertSent(period: string): Promise<boolean> {
  try {
    await db.aiBudgetAlert.create({
      data: { billingPeriod: period },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return false;
    }
    throw error;
  }
}

export async function checkThresholdAndNotify(period?: string): Promise<void> {
  const billingPeriod = period ?? currentBillingPeriodUtc();
  const config = await getActiveBudget(billingPeriod);
  if (!config || !config.notifyEmails?.length) {
    return;
  }

  const spend = await getCurrentSpend(billingPeriod);
  const thresholdAmount =
    config.monthlyBudgetEur * (config.alertThresholdPct / 100);

  if (spend < thresholdAmount) {
    return;
  }

  if (await hasAlertBeenSent(billingPeriod)) {
    return;
  }

  const inserted = await markAlertSent(billingPeriod);
  if (!inserted) {
    return;
  }

  const { BudgetAlertEmail, buildBudgetAlertSubject } = await import(
    './emails/budget-alert-email'
  );

  const emailProps = {
    billingPeriod,
    spendEur: spend,
    budgetEur: config.monthlyBudgetEur,
    thresholdPct: config.alertThresholdPct,
  };

  const subject = buildBudgetAlertSubject(billingPeriod);

  for (const to of config.notifyEmails) {
    const result = await sendEmail({
      to,
      subject,
      react: BudgetAlertEmail(emailProps),
    });
    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: 'ai_budget_alert_email_failed',
          billingPeriod,
          error: result.error,
        }),
      );
    }
  }

  console.info(
    JSON.stringify({
      event: 'ai_budget_alert_sent',
      billingPeriod,
      recipientCount: config.notifyEmails.length,
    }),
  );
}

export async function updateBudgetConfig(
  userId: string,
  input: UpdateBudgetConfigInput,
  auditContext: { ip: string | null; userAgent: string | null },
): Promise<BudgetConfigSnapshot> {
  const billingPeriod = input.billingPeriod ?? null;

  const existing = await db.aiBudgetConfig.findFirst({
    where: {
      billingPeriod,
      deletedAt: null,
    },
  });

  const previousBudget = existing
    ? toNumber(existing.monthlyBudgetEur)
    : null;

  const data = {
    monthlyBudgetEur: new Prisma.Decimal(input.monthlyBudgetEur),
    alertThresholdPct: input.alertThresholdPct,
    modelByPageType: input.modelByPageType ?? Prisma.JsonNull,
    notifyEmails: input.notifyEmails ?? Prisma.JsonNull,
    isActive: input.isActive ?? true,
    updatedById: userId,
  };

  const saved = await db.$transaction(async (tx) => {
    const row = existing
      ? await tx.aiBudgetConfig.update({
          where: { id: existing.id },
          data,
        })
      : await tx.aiBudgetConfig.create({
          data: {
            ...data,
            billingPeriod,
            createdById: userId,
          },
        });

    await recordAudit(
      {
        userId,
        action: AuditAction.ai_config_update,
        entityType: 'ai_budget_config',
        entityId: row.id,
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        metadata: {
          previousBudget: previousBudget ?? undefined,
          newBudget: input.monthlyBudgetEur,
        },
      },
      { tx },
    );

    return row;
  });

  return mapConfig(saved);
}
