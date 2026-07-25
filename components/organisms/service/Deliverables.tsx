import type { ServiceDeliverableItem } from '@/lib/service/parse-service-content';

export type ServiceDeliverablesProps = {
  items: ServiceDeliverableItem[];
};

export function ServiceDeliverables({ items }: ServiceDeliverablesProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-neutral/50 py-12 md:py-16" aria-labelledby="service-deliverables-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-deliverables-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Entregables
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="border-b border-brand-secondary/20">
                <th scope="col" className="py-3 pr-4 font-semibold text-brand-on-surface">
                  Documento / entrega
                </th>
                <th scope="col" className="py-3 font-semibold text-brand-on-surface">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-brand-secondary/10">
                  <td className="py-3 pr-4 font-medium text-brand-on-surface">
                    {item.kind === 'text' ? item.value : item.name}
                  </td>
                  <td className="py-3 text-muted">
                    {item.kind === 'structured' ? (item.description ?? '—') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
