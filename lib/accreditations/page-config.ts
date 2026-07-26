import { CredentialType } from '@prisma/client';

export const ACCREDITATIONS_PAGE_BASE_PATH = '/acreditaciones';

export const ACCREDITATIONS_PAGE_METADATA = {
  title: 'Acreditaciones y certificaciones | Geoteknia',
  description:
    'Solvencia técnica respaldada por acreditación ENAC, certificaciones ISO, registros oficiales, seguros RC y asociaciones del sector geotécnico.',
};

export const CREDENTIAL_TYPE_SECTION_ORDER: CredentialType[] = [
  CredentialType.enac,
  CredentialType.iso,
  CredentialType.registro_ministerio,
  CredentialType.clasificacion_contratista,
  CredentialType.seguro_rc,
  CredentialType.asociacion,
];

export const CREDENTIAL_TYPE_SECTION_LABELS: Record<CredentialType, string> = {
  [CredentialType.enac]: 'Acreditación ENAC',
  [CredentialType.iso]: 'Certificaciones ISO',
  [CredentialType.registro_ministerio]: 'Registros oficiales',
  [CredentialType.clasificacion_contratista]: 'Clasificación de contratista',
  [CredentialType.seguro_rc]: 'Seguros de responsabilidad civil',
  [CredentialType.asociacion]: 'Asociaciones y colegios',
};
