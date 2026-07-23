export { sendEmail, setResendClientForTests, type SendEmailInput, type SendEmailResult } from './client';
export {
  clearLeadConfirmationRegistryForTests,
  getLeadConfirmationResendId,
  hasLeadConfirmationBeenSent,
  registerLeadConfirmationSent,
} from './idempotency';
export {
  LeadConfirmationValidationError,
  sendLeadConfirmation,
  type SendLeadConfirmationInput,
  type SendLeadConfirmationResult,
} from './send-lead-confirmation';
export {
  buildLeadConfirmationSubject,
  resolveTechnicianDisplayName,
  RESPONSE_DEADLINE_COPY,
  TECHNICIAN_FALLBACK_COPY,
  type LeadConfirmationEmailProps,
} from './templates/lead-confirmation';
export { LeadConfirmationEmail } from './templates/lead-confirmation-email';
