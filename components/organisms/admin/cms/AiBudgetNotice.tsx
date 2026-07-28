'use client';

type Props = {
  message?: string;
};

export function AiBudgetNotice({
  message = 'Presupuesto mensual de IA alcanzado. No se puede iniciar una nueva generación hasta el próximo periodo.',
}: Props) {
  return (
    <div
      role="alert"
      data-testid="ai-budget-notice"
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-semibold">Presupuesto de IA agotado</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
