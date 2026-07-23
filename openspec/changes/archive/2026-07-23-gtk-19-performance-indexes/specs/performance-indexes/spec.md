# Delta Spec — performance-indexes

## ADDED Requirements

### Requirement: Partial publication indexes for ISR content

The system SHALL provide partial btree indexes on `slug` for publishable content entities, filtered to `workflow_status = 'publicado' AND deleted_at IS NULL`, on: `services`, `geo_zones`, `service_zone_pages`, and `case_studies`.

#### Scenario: ISR route resolution uses partial index

- **WHEN** a query resolves published content by slug with workflow and soft-delete filters
- **THEN** PostgreSQL uses the partial publication index instead of a sequential scan

### Requirement: Partial soft-delete indexes for CRM

The system SHALL provide partial btree indexes on `created_at` filtered to `deleted_at IS NULL` for: `leads`, `projects`, and `contacts`.

#### Scenario: CRM listing excludes soft-deleted rows efficiently

- **WHEN** the CRM lists active leads ordered by creation date
- **THEN** PostgreSQL uses the partial soft-delete index

### Requirement: BRIN temporal indexes for append-only tables

The system SHALL provide BRIN indexes on temporal columns for high-growth append-only tables: `conversion_events(occurred_at)`, `audit_logs(created_at)`, `ai_token_usage(created_at)`, and `project_state_history(created_at)`.

#### Scenario: Temporal range reporting on conversion events

- **WHEN** reporting queries filter conversion events by date range
- **THEN** PostgreSQL can use the BRIN index on `occurred_at`

### Requirement: GIN index on leads project_data JSON

The system SHALL provide a GIN index with `jsonb_path_ops` on `leads.project_data` to support key-based filtering in reporting.

#### Scenario: Filter leads by JSON key in project_data

- **WHEN** a reporting query filters leads by a key within `project_data`
- **THEN** PostgreSQL can use the GIN index

### Requirement: blog_posts index deferred

The partial publication index for `blog_posts` SHALL be added when the `blog_posts` table is materialized (GTK-13), not in this change.

#### Scenario: blog_posts table absent

- **WHEN** this migration is applied before GTK-13
- **THEN** no index is created on non-existent `blog_posts`
