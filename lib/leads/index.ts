export {
  budgetLeadSchema,
  contactBaseSchema,
  locationLeadSchema,
  professionalRoleSchema,
  emailField,
  phoneField,
  type BudgetLeadInput,
  type ContactBaseInput,
  type LocationLeadInput,
} from './schema';
export { deriveLeadSource } from './attribution';
export {
  formatReferenceNumberCandidate,
  generateUniqueReferenceNumber,
  MAX_REFERENCE_GENERATION_ATTEMPTS,
} from './reference';
export { upsertContact, type UpsertContactInput } from './upsert-contact';
export { LeadCaptureError } from './errors';
export { createBudgetLead, type CreateBudgetLeadResult } from './create-lead';
export {
  createLocationLead,
  type CreateLocationLeadResult,
} from './create-location-lead';
