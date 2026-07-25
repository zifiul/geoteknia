# Spec Delta: Content Publication & Lead Magnets (GTK-30)

## ADDED Requirements

### Requirement: Public Gated Lead Magnet Lookup
The system SHALL provide a public helper `findGatedLeadMagnetBySlug(slug)` to retrieve an active gated resource without requiring administrative portal session authentication.

#### Scenario: Active gated lead magnet found
- **Given** a `LeadMagnet` record exists in the database with `slug = "guia-geotecnia-2026"`, `is_gated = true`, `file_id` is NOT NULL, and `deleted_at` IS NULL
- **When** `findGatedLeadMagnetBySlug("guia-geotecnia-2026")` is called
- **Then** it MUST return the `LeadMagnet` record including its title, thank-you URL, associated `file_id`, and `service_id` if present.

#### Scenario: Inactive, un-gated or deleted lead magnet requested
- **Given** a `LeadMagnet` record has `slug = "guia-libre"`, with either `is_gated = false`, `file_id` IS NULL, or `deleted_at` IS NOT NULL
- **When** `findGatedLeadMagnetBySlug("guia-libre")` is called
- **Then** it MUST return `null` (causing a 404 RESOURCE_NOT_FOUND response at the API level).

#### Scenario: Non-existent slug requested
- **Given** no `LeadMagnet` record exists with `slug = "slug-inexistente"`
- **When** `findGatedLeadMagnetBySlug("slug-inexistente")` is called
- **Then** it MUST return `null`.

### Requirement: Resource Lead Capture Endpoint
The system SHALL expose a public HTTP Route Handler `POST /api/recursos/[slug]` to capture contact details in exchange for a gated resource download.

#### Scenario: Successful gated resource lead capture
- **Given** an active gated lead magnet with slug `"guia-geotecnia-2026"`
- **When** a valid `POST /api/recursos/guia-geotecnia-2026` request is submitted with valid Turnstile token, full name, email, `gdprConsent = true`, and optional company/phone/role
- **Then** the system MUST:
  1. Upsert the contact record in `contacts` by email or phone.
  2. Create a `lead` record in a transaction with `lead_type = 'recurso'`, `channel = 'lead_magnet'`, linked `lead_magnet_id`, and reference number starting with `REC-YYYYMMDD-`.
  3. Create an associated `project` record with initial state.
  4. Trigger transactional lead confirmation email post-commit with fallback values (`serviceName: leadMagnet.title`, `province: 'Por determinar'`).
  5. Asynchronously record a `resource_download` event in `conversion_events`.
  6. Return HTTP 201 Created with JSON envelope containing `downloadUrl` (unlisted token/single-use download URL) and `thankYouUrl`.

#### Scenario: Invalid input payload or missing GDPR consent
- **When** a `POST /api/recursos/[slug]` request is received with invalid email, missing `turnstileToken`, or `gdprConsent != true`
- **Then** the system MUST reject the request with HTTP 400 Bad Request and Zod validation details (`VALIDATION_ERROR`).

#### Scenario: Invalid Turnstile token
- **When** a `POST /api/recursos/[slug]` request contains an invalid or expired Cloudflare Turnstile token
- **Then** the system MUST return HTTP 403 Forbidden (`TURNSTILE_INVALID`).

#### Scenario: Rate limit exceeded
- **When** client IP exceeds the configured public rate limit on `/api/recursos/[slug]`
- **Then** the system MUST return HTTP 429 Too Many Requests (`RATE_LIMITED`) with a `Retry-After` header.
