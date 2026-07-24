import type { Metadata } from 'next';

import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { requirePermission } from '@/lib/auth/rbac';
import { getActiveBudget, getCostReport } from '@/lib/ia';

export const metadata: Metadata = {
  title: 'Presupuesto IA — Portal Geoteknia',
  robots: { index: false, follow: false },
};

export default async function IaPresupuestoPage() {
  const { report, config } = await runWithPortalReadAccess(async () => {
    await requirePermission('ai.read');
    const reportData = await getCostReport();
    const activeConfig = await getActiveBudget(reportData.billingPeriod);
    return { report: reportData, config: activeConfig };
  });

  return (
    <main>
      <h1>Presupuesto y coste IA</h1>
      <p>
        Periodo UTC: <strong>{report.billingPeriod}</strong>
      </p>
      <section aria-labelledby="gasto-heading">
        <h2 id="gasto-heading">Gasto acumulado</h2>
        <p>{report.totalEur.toFixed(2)} EUR</p>
        {config ? (
          <p>
            Presupuesto configurado: {config.monthlyBudgetEur.toFixed(2)} EUR (umbral{' '}
            {config.alertThresholdPct} %)
          </p>
        ) : (
          <p>Sin configuración activa (guardarraíl en modo fail-open).</p>
        )}
      </section>
      <section aria-labelledby="modelo-heading">
        <h2 id="modelo-heading">Por modelo</h2>
        {report.byModel.length === 0 ? (
          <p>Sin uso registrado en este periodo.</p>
        ) : (
          <ul>
            {report.byModel.map((row) => (
              <li key={row.model}>
                {row.model}: {row.totalEur.toFixed(4)} EUR
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="pagina-heading">
        <h2 id="pagina-heading">Por tipo de página</h2>
        {report.byPageType.length === 0 ? (
          <p>Sin desglose por tipo de página.</p>
        ) : (
          <ul>
            {report.byPageType.map((row) => (
              <li key={row.pageType}>
                {row.pageType}: {row.totalEur.toFixed(4)} EUR
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
