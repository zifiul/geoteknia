import { z } from 'zod';

/** Códigos de ensayo in situ almacenados en `machinery.in_situ_tests` (JSON). */
export const MACHINERY_IN_SITU_TEST_CODES = [
  'SPT',
  'DPSH',
  'Lefranc',
  'Lugeon',
  'presiometro',
  'penetrometro',
] as const;

export const machineryInSituTestCodeSchema = z.enum(MACHINERY_IN_SITU_TEST_CODES);

export const machineryInSituTestsSchema = z.array(machineryInSituTestCodeSchema);

export type MachineryInSituTestCode = z.infer<typeof machineryInSituTestCodeSchema>;

const LEGACY_LABEL_TO_CODE: Record<string, MachineryInSituTestCode> = {
  SPT: 'SPT',
  DPSH: 'DPSH',
  Lefranc: 'Lefranc',
  Lugeon: 'Lugeon',
  presiometro: 'presiometro',
  presiómetro: 'presiometro',
  penetrometro: 'penetrometro',
  penetrómetro: 'penetrometro',
};

/** Etiquetas legibles en UI (español). */
export const MACHINERY_IN_SITU_TEST_LABELS: Record<MachineryInSituTestCode, string> = {
  SPT: 'SPT (ensayo de penetración estándar)',
  DPSH: 'DPSH (penetración dinámica superpesada)',
  Lefranc: 'Ensayo de Lefranc',
  Lugeon: 'Ensayo de Lugeon',
  presiometro: 'Presiómetro',
  penetrometro: 'Penetrómetro',
};

export function parseStoredMachineryInSituTests(value: unknown): MachineryInSituTestCode[] | null {
  if (value == null) {
    return null;
  }

  const direct = machineryInSituTestsSchema.safeParse(value);
  if (direct.success && direct.data.length > 0) {
    return direct.data;
  }

  if (Array.isArray(value)) {
    const normalized: MachineryInSituTestCode[] = [];
    for (const entry of value) {
      if (typeof entry === 'string') {
        const code = LEGACY_LABEL_TO_CODE[entry] ?? machineryInSituTestCodeSchema.safeParse(entry);
        if (typeof code === 'string') {
          normalized.push(code);
        } else if (code.success) {
          normalized.push(code.data);
        }
      } else if (entry && typeof entry === 'object' && 'code' in entry) {
        const raw = (entry as { code: unknown }).code;
        const parsed = machineryInSituTestCodeSchema.safeParse(raw);
        if (parsed.success) {
          normalized.push(parsed.data);
        }
      }
    }
    return normalized.length > 0 ? normalized : null;
  }

  return null;
}
