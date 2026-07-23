import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

import {
  RESPONSE_DEADLINE_COPY,
  type LeadConfirmationEmailProps,
} from './lead-confirmation';

export type { LeadConfirmationEmailProps } from './lead-confirmation';
export {
  buildLeadConfirmationSubject,
  resolveTechnicianDisplayName,
  RESPONSE_DEADLINE_COPY,
  TECHNICIAN_FALLBACK_COPY,
} from './lead-confirmation';

export function LeadConfirmationEmail({
  referenceNumber,
  technicianName,
  serviceName,
  province,
}: LeadConfirmationEmailProps) {
  const previewText = `Hemos recibido su solicitud (${referenceNumber}). Respuesta en ${RESPONSE_DEADLINE_COPY}.`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Solicitud recibida</Heading>
          <Text style={textStyle}>
            Gracias por contactar con Geoteknia. Hemos registrado su solicitud
            con el número de referencia <strong>{referenceNumber}</strong>.
          </Text>
          <Section style={detailsStyle}>
            <Text style={detailLineStyle}>
              <strong>Servicio:</strong> {serviceName}
            </Text>
            <Text style={detailLineStyle}>
              <strong>Provincia:</strong> {province}
            </Text>
            <Text style={detailLineStyle}>
              <strong>Técnico asignado:</strong> {technicianName}
            </Text>
          </Section>
          <Text style={textStyle}>
            Su solicitud será revisada por nuestro equipo. Recibirá una
            propuesta en un máximo de <strong>{RESPONSE_DEADLINE_COPY}</strong>.
          </Text>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            Geoteknia — Ingeniería geotécnica
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const containerStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '24px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const headingStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px',
};

const textStyle = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const detailsStyle = {
  backgroundColor: '#f4f4f5',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 16px',
};

const detailLineStyle = {
  ...textStyle,
  margin: '0 0 8px',
};

const hrStyle = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const footerStyle = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
};
