export type TemplateInputValidationResult =
  | { ok: true }
  | { ok: false; message: string; path?: string };

type JsonSchemaProperty = {
  type?: string;
  items?: { type?: string };
};

type JsonSchemaObject = {
  type?: string;
  required?: string[];
  properties?: Record<string, JsonSchemaProperty>;
};

function validatePropertyType(
  key: string,
  value: unknown,
  prop: JsonSchemaProperty,
): TemplateInputValidationResult {
  const expected = prop.type ?? 'string';
  if (expected === 'string') {
    if (typeof value !== 'string') {
      return { ok: false, message: `Debe ser texto`, path: key };
    }
    return { ok: true };
  }
  if (expected === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return { ok: false, message: `Debe ser número`, path: key };
    }
    return { ok: true };
  }
  if (expected === 'boolean') {
    if (typeof value !== 'boolean') {
      return { ok: false, message: `Debe ser booleano`, path: key };
    }
    return { ok: true };
  }
  if (expected === 'array') {
    if (!Array.isArray(value)) {
      return { ok: false, message: `Debe ser un array`, path: key };
    }
    const itemType = prop.items?.type ?? 'string';
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (itemType === 'string' && typeof item !== 'string') {
        return { ok: false, message: `Elemento debe ser texto`, path: `${key}[${i}]` };
      }
    }
    return { ok: true };
  }
  return { ok: true };
}

/**
 * Validador mínimo del subconjunto JSON Schema usado en `prompt_templates.input_schema`.
 */
export function validateTemplateInputs(
  schemaJson: unknown,
  inputs: Record<string, unknown>,
): TemplateInputValidationResult {
  if (schemaJson === null || typeof schemaJson !== 'object' || Array.isArray(schemaJson)) {
    return { ok: false, message: 'input_schema de plantilla inválido' };
  }

  const schema = schemaJson as JsonSchemaObject;
  if (schema.type && schema.type !== 'object') {
    return { ok: false, message: 'input_schema debe ser type object' };
  }

  const required = schema.required ?? [];
  for (const key of required) {
    if (!(key in inputs) || inputs[key] === undefined || inputs[key] === null) {
      return { ok: false, message: `Campo requerido`, path: key };
    }
  }

  const properties = schema.properties ?? {};
  for (const [key, value] of Object.entries(inputs)) {
    const prop = properties[key];
    if (!prop) {
      continue;
    }
    const result = validatePropertyType(key, value, prop);
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
