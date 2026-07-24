import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

import {
  buildBudgetAlertSubject,
  type BudgetAlertEmailProps,
} from './budget-alert';

export type { BudgetAlertEmailProps } from './budget-alert';
export { buildBudgetAlertSubject };

export function BudgetAlertEmail({
  billingPeriod,
  spendEur,
  budgetEur,
  thresholdPct,
}: BudgetAlertEmailProps) {
  const previewText = `Gasto IA ${billingPeriod}: ${spendEur.toFixed(2)} EUR de ${budgetEur.toFixed(2)} EUR`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Umbral de presupuesto IA alcanzado</Heading>
          <Text style={textStyle}>
            El gasto acumulado en generaciones con Claude para el periodo{' '}
            <strong>{billingPeriod}</strong> (UTC) ha alcanzado el umbral configurado (
            {thresholdPct}%).
          </Text>
          <Text style={textStyle}>
            Gasto actual: <strong>{spendEur.toFixed(2)} EUR</strong>
            <br />
            Presupuesto mensual: <strong>{budgetEur.toFixed(2)} EUR</strong>
          </Text>
          <Text style={textStyle}>
            Revise el panel de presupuesto en el portal admin y ajuste el tope o el
            umbral si es necesario.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Helvetica, Arial, sans-serif',
};

const containerStyle = {
  margin: '0 auto',
  padding: '24px',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
};

const headingStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
};

const textStyle = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#404040',
};
