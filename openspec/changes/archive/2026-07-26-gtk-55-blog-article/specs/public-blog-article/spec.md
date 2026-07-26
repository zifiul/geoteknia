# Delta spec — public-blog-article

## ADDED Requirements

### Requirement: Public blog article route

The system SHALL serve `/blog/{categorySlug}/{slug}` for each published blog post with SSG/ISR and return 404 when the post is missing, unpublished, or the category slug does not match.

#### Scenario: Published article

- **WHEN** a visitor requests a URL matching a published post and category
- **THEN** the response is 200 with a single `h1`, sanitized body HTML, and optional TOC from stored `toc` JSON

#### Scenario: Unknown slug

- **WHEN** the slug or category does not match a published post
- **THEN** the response is 404

### Requirement: Article JSON-LD and metadata

The article page SHALL emit JSON-LD `Article` (with `author` name and url when the team profile is published, `datePublished`, `dateModified`, `publisher`) and `BreadcrumbList`, and SHALL set canonical metadata via `buildMetadata()` with `categorySlug`.

#### Scenario: Rich results fields

- **WHEN** the article and author profile are published
- **THEN** the HTML contains `Article` JSON-LD with `publisher` and `dateModified`

### Requirement: CMS body safety

The system SHALL sanitize `blog_posts.body` on the server before rendering and SHALL NOT emit executable markup (e.g. `script`, event handlers).

#### Scenario: Sanitized output

- **WHEN** stored body contains a script tag
- **THEN** the rendered article HTML does not include `<script`

### Requirement: TOC contract

The stored `toc` field SHALL conform to `{ id: string; text: string; level: 2 | 3 }[]`; empty or invalid stored values SHALL hide the TOC block without failing the page.

#### Scenario: Valid TOC

- **WHEN** `toc` is a non-empty valid array
- **THEN** the page shows navigable anchor links

### Requirement: Author and related services

When the linked team member is published, the page SHALL show an author box linking to `/equipo/{slug}`. When `blog_post_services` links exist, the page SHALL list related published services and a contextual budget CTA using the primary related service slug.

#### Scenario: Published author

- **WHEN** the team author slug resolves to a published profile
- **THEN** the author box links to the team member page
