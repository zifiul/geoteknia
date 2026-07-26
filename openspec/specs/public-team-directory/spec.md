# public-team-directory Specification

## Purpose

Directorio público `/equipo` y fichas individuales con JSON-LD `Person`, metadata sintética y casos enlazados por técnico. Materializado con GTK-56.
## Requirements
### Requirement: Directorio de equipo publicado

The system SHALL expose `/equipo` listing published team members via `listPublishedTeamMembers()` with links to `/equipo/[slug]`.

#### Scenario: Perfiles publicados

- **WHEN** the user visits `/equipo`
- **THEN** each published member is shown with name, role and link to their profile

#### Scenario: Sin perfiles

- **WHEN** no published members exist
- **THEN** the page renders an empty state without error

### Requirement: Ficha individual estática

The system SHALL generate static params from published slugs and return 404 for unknown or unpublished slugs.

#### Scenario: Slug válido

- **WHEN** `getPublishedTeamMemberBySlug(slug)` returns a row
- **THEN** the page renders profile fields and JSON-LD `Person` plus `BreadcrumbList`

#### Scenario: Slug inválido

- **WHEN** the slug is missing or not published
- **THEN** the response is 404

### Requirement: Proyectos del técnico

The profile SHALL list linked published case studies via `listPublishedCaseStudiesByTeamMember(teamMemberId)` and hide the section when empty.

#### Scenario: Con casos

- **WHEN** the member has published linked cases
- **THEN** descriptive links to `/proyectos/[slug]` are shown

### Requirement: Metadata sintética Person

Profile metadata SHALL use a synthetic `SeoBlockInput` with `schemaType: Person` and `noindex: false` always.

#### Scenario: Title y description

- **WHEN** metadata is generated for a profile
- **THEN** title derives from name and job title and description from bio (truncated)

