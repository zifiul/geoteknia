import { describe, expect, it } from 'vitest';

import {
  buildWhatsAppMessage,
  humanizeSlug,
  interpolateWhatsAppTemplate,
} from '@/lib/contact/build-whatsapp-message';
import {
  contactDepartmentLabel,
  resolveContactDepartmentForPath,
  resolveLayoutContactChannel,
} from '@/lib/contact/contact-department';
import {
  buildWhatsAppUrl,
  parseContactContextSlugs,
} from '@/lib/navigation/cta-query';

describe('buildWhatsAppUrl', () => {
  it('genera wa.me sin texto cuando no hay mensaje', () => {
    expect(buildWhatsAppUrl('+34 600 11 22 33')).toBe('https://wa.me/34600112233');
  });

  it('codifica el parámetro text', () => {
    const url = buildWhatsAppUrl('600112233', 'Hola, servicio & zona');
    expect(url).toBe('https://wa.me/600112233?text=Hola%2C%20servicio%20%26%20zona');
  });
});

describe('parseContactContextSlugs', () => {
  it('extrae servicio y provincia del path de servicio-zona', () => {
    expect(parseContactContextSlugs('/servicios/ensayos/madrid')).toEqual({
      serviceSlug: 'ensayos',
      provinceSlug: 'madrid',
    });
  });

  it('prioriza query params sobre el path', () => {
    const params = new URLSearchParams('servicio=foo&provincia=bar');
    expect(parseContactContextSlugs('/contacto', params)).toEqual({
      serviceSlug: 'foo',
      provinceSlug: 'bar',
    });
  });
});

describe('buildWhatsAppMessage', () => {
  it('interpola plantilla con etiquetas', () => {
    const message = buildWhatsAppMessage('Hola {{servicio}} en {{provincia}}', {
      servicio: 'Ensayos',
      provincia: 'Madrid',
    });
    expect(message).toBe('Hola Ensayos en Madrid');
  });

  it('usa mensaje por defecto si no hay plantilla', () => {
    const message = buildWhatsAppMessage(null, { servicio: 'A', provincia: 'B' });
    expect(message).toContain('A');
    expect(message).toContain('B');
  });
});

describe('interpolateWhatsAppTemplate', () => {
  it('reemplaza placeholders vacíos', () => {
    expect(interpolateWhatsAppTemplate('{{servicio}}', {})).toBe('');
  });
});

describe('humanizeSlug', () => {
  it('formatea slug kebab-case', () => {
    expect(humanizeSlug('estudio-geotecnico')).toBe('Estudio Geotecnico');
  });
});

describe('resolveContactDepartmentForPath', () => {
  it('asigna presupuestos a servicios y zonas', () => {
    expect(resolveContactDepartmentForPath('/servicios/foo')).toBe('presupuestos');
    expect(resolveContactDepartmentForPath('/zonas/bar')).toBe('presupuestos');
  });

  it('asigna licitaciones a /licitaciones', () => {
    expect(resolveContactDepartmentForPath('/licitaciones')).toBe('licitaciones');
  });

  it('devuelve null en home', () => {
    expect(resolveContactDepartmentForPath('/')).toBeNull();
  });
});

describe('resolveLayoutContactChannel', () => {
  const presupuestos = {
    phone: '+34900000001',
    whatsappNumber: '+34900000001',
    email: 'p@example.com',
    prefilledMessageTemplate: null,
  };
  const general = {
    phone: '+34900000999',
    whatsappNumber: null,
    email: null,
    prefilledMessageTemplate: null,
  };

  it('usa canal presupuestos en página de servicio', () => {
    const { channel } = resolveLayoutContactChannel('/servicios/x', {
      general,
      presupuestos,
      licitaciones: null,
    });
    expect(channel?.phone).toBe('+34900000001');
  });

  it('usa canal general en home', () => {
    const { channel } = resolveLayoutContactChannel('/', {
      general,
      presupuestos,
      licitaciones: null,
    });
    expect(channel?.phone).toBe('+34900000999');
  });
});

describe('contactDepartmentLabel', () => {
  it('etiqueta presupuestos', () => {
    expect(contactDepartmentLabel('presupuestos')).toBe('presupuestos');
  });
});
