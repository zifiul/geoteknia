import { z } from 'zod';

const methodologyStepSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

const methodologySchema = z.union([
  z.array(methodologyStepSchema),
  z.object({ steps: z.array(methodologyStepSchema) }),
]);

export type ServiceMethodologyStep = z.infer<typeof methodologyStepSchema>;

export function parseServiceMethodology(value: unknown): ServiceMethodologyStep[] {
  const parsed = methodologySchema.safeParse(value);
  if (!parsed.success) {
    return [];
  }
  if (Array.isArray(parsed.data)) {
    return parsed.data;
  }
  return parsed.data.steps;
}

const deliverableItemSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
]);

export type ServiceDeliverableItem =
  | { kind: 'text'; value: string }
  | { kind: 'structured'; name: string; description?: string };

export function parseServiceDeliverables(value: unknown): ServiceDeliverableItem[] {
  const parsed = z.array(deliverableItemSchema).safeParse(value);
  if (!parsed.success) {
    return [];
  }
  return parsed.data.map((entry) => {
    if (typeof entry === 'string') {
      return { kind: 'text' as const, value: entry };
    }
    return {
      kind: 'structured' as const,
      name: entry.name,
      description: entry.description,
    };
  });
}
