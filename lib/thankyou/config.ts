import type { ConversionEventName, LeadType } from '@prisma/client';

export type ThankYouKind = 'presupuesto' | 'licitacion' | 'ubicacion' | 'recurso';

export type ThankYouNextStep = {
  href: string;
  label: string;
  description: string;
};

export type ThankYouKindConfig = {
  kind: ThankYouKind;
  referencePrefix: 'PRE' | 'LIC' | 'UBI' | 'REC';
  eventName: ConversionEventName;
  leadType: LeadType;
  metadataTitle: string;
  metadataDescription: string;
  headlineSuccess: string;
  headlineGeneric: string;
  bodySuccess: string;
  bodyGeneric: string;
  nextSteps: ThankYouNextStep[];
  showTechnicianBlock: boolean;
};

export const THANK_YOU_KINDS: ThankYouKind[] = [
  'presupuesto',
  'licitacion',
  'ubicacion',
  'recurso',
];

const SHARED_NEXT_STEPS: ThankYouNextStep[] = [
  {
    href: '/proyectos',
    label: 'Ver casos de estudio',
    description: 'Ejemplos reales de estudios geotécnicos en obra.',
  },
  {
    href: '/calculadora',
    label: 'Usar la calculadora',
    description: 'Estime alcance de sondeos y ensayos para su proyecto.',
  },
  {
    href: '/blog',
    label: 'Leer el blog técnico',
    description: 'Guías y normativa aplicada al terreno.',
  },
];

export const THANK_YOU_CONFIG: Record<ThankYouKind, ThankYouKindConfig> = {
  presupuesto: {
    kind: 'presupuesto',
    referencePrefix: 'PRE',
    eventName: 'generate_lead',
    leadType: 'presupuesto',
    metadataTitle: 'Solicitud recibida — Geoteknia',
    metadataDescription:
      'Confirmación de su solicitud de presupuesto. Nuestro equipo revisará los datos y le contactará en el plazo indicado.',
    headlineSuccess: 'Hemos recibido su solicitud de presupuesto',
    headlineGeneric: 'Gracias por contactar con Geoteknia',
    bodySuccess:
      'Hemos registrado su petición. Guarde el número de referencia por si necesita ampliar información por teléfono o email.',
    bodyGeneric:
      'Si acaba de enviar un formulario, recibirá un email de confirmación en breve. Si llegó aquí por error, puede solicitar presupuesto desde nuestros servicios.',
    nextSteps: SHARED_NEXT_STEPS,
    showTechnicianBlock: true,
  },
  licitacion: {
    kind: 'licitacion',
    referencePrefix: 'LIC',
    eventName: 'generate_lead',
    leadType: 'licitacion',
    metadataTitle: 'Expediente registrado — Geoteknia',
    metadataDescription:
      'Confirmación de registro de su consulta sobre licitación u obra pública.',
    headlineSuccess: 'Hemos registrado su consulta de licitación',
    headlineGeneric: 'Gracias por su interés en licitaciones',
    bodySuccess:
      'Revisaremos el expediente o enlace facilitado y le responderemos con el plazo acordado.',
    bodyGeneric:
      'Si acaba de enviar el formulario de licitaciones, recibirá confirmación por email.',
    nextSteps: [
      {
        href: '/licitaciones',
        label: 'Volver a licitaciones',
        description: 'Clasificación, proyectos públicos y formulario de expediente.',
      },
      ...SHARED_NEXT_STEPS,
    ],
    showTechnicianBlock: true,
  },
  ubicacion: {
    kind: 'ubicacion',
    referencePrefix: 'UBI',
    eventName: 'send_location',
    leadType: 'ubicacion',
    metadataTitle: 'Ubicación recibida — Geoteknia',
    metadataDescription:
      'Confirmación de envío de ubicación de parcela para estudio geotécnico.',
    headlineSuccess: 'Hemos recibido la ubicación de su parcela',
    headlineGeneric: 'Gracias por compartir la ubicación',
    bodySuccess:
      'Nuestro equipo validará la parcela y le contactará para los siguientes pasos del estudio.',
    bodyGeneric:
      'Si acaba de enviar la ubicación desde el mapa, recibirá un email de confirmación.',
    nextSteps: SHARED_NEXT_STEPS,
    showTechnicianBlock: true,
  },
  recurso: {
    kind: 'recurso',
    referencePrefix: 'REC',
    eventName: 'resource_download',
    leadType: 'recurso',
    metadataTitle: 'Descarga confirmada — Geoteknia',
    metadataDescription:
      'Confirmación de acceso al recurso técnico solicitado.',
    headlineSuccess: 'Su recurso está listo',
    headlineGeneric: 'Gracias por su interés en nuestros recursos',
    bodySuccess:
      'Puede descargar el documento con el enlace siguiente. También le hemos enviado un email con la misma información.',
    bodyGeneric:
      'Si acaba de solicitar un recurso técnico, revise su bandeja de entrada o vuelva al catálogo.',
    nextSteps: [
      {
        href: '/recursos',
        label: 'Explorar más recursos',
        description: 'Guías y documentación técnica para su proyecto.',
      },
      ...SHARED_NEXT_STEPS,
    ],
    showTechnicianBlock: false,
  },
};

export const THANK_YOU_SESSION_KEY_PREFIX = 'ty_fired:';
