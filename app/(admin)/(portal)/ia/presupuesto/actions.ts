'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { extractRequestAuditContext } from '@/lib/audit/request-context';
import { withPermission } from '@/lib/auth/rbac';
import {
  getCostReport,
  updateBudgetConfig,
  updateBudgetConfigSchema,
  type BudgetConfigSnapshot,
  type CostReport,
} from '@/lib/ia';
import { runIaAction, type IaActionResult } from '@/lib/ia/ia-action-result';

const PRESUPUESTO_PATH = '/ia/presupuesto';

export const updateBudgetConfigAction = withPermission(
  'ai.configure',
  async (user, raw: unknown): Promise<IaActionResult<BudgetConfigSnapshot>> => {
    return runIaAction(async () => {
      const input = updateBudgetConfigSchema.parse(raw);
      const headerList = await headers();
      const auditContext = extractRequestAuditContext(headerList);
      const config = await updateBudgetConfig(user.userId, input, auditContext);
      revalidatePath(PRESUPUESTO_PATH);
      return config;
    });
  },
);

export const loadCostReportAction = withPermission(
  'ai.read',
  async (): Promise<IaActionResult<CostReport>> => {
    return runIaAction(async () => getCostReport());
  },
);
