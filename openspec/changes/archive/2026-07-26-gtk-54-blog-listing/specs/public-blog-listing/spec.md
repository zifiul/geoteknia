# Delta spec — public-blog-listing

## ADDED Requirements

### Requirement: Blog index lists published posts

The system SHALL serve `/blog` as an RSC listing published blog posts ordered by `publishedAt` descending, with optional `?page=` pagination.

#### Scenario: Default page

- **WHEN** a visitor requests `/blog` without query params
- **THEN** the response is 200 and shows page 1 of published posts

#### Scenario: Paginated index

- **WHEN** a visitor requests `/blog?page=2` and enough posts exist
- **THEN** the response is 200, shows page 2, and emits a self-referential canonical including `page=2`

### Requirement: Category listing and 404

The system SHALL serve `/blog/[categoria]` for each non-deleted category slug from `listPublishedBlogCategories()`, filtering posts to that category.

#### Scenario: Valid category

- **WHEN** the category slug exists
- **THEN** the response is 200 and only posts in that category are listed

#### Scenario: Unknown category

- **WHEN** the category slug does not exist
- **THEN** the response is 404

### Requirement: SEO listing contract

The system SHALL use GTK-78 listing helpers with `hasActiveFilters: false` for robots on all paginated blog listing pages.

#### Scenario: Paginated robots

- **WHEN** any listing page includes `?page=N` with N ≥ 1
- **THEN** robots metadata is `index, follow` unless the category has `noindex` set in CMS

### Requirement: Category navigation accessibility

The system SHALL render category navigation with `aria-current="page"` on the active category (or blog index for “all”).

#### Scenario: Active category pill

- **WHEN** the visitor is on `/blog/normativa`
- **THEN** the Normativa link in category navigation has `aria-current="page"`

### Requirement: Empty category state

When a category has no published posts, the system SHALL show an empty state with links to other categories.

#### Scenario: Empty normativa

- **WHEN** the category exists but has zero published posts
- **THEN** the page shows an empty message and links to other category routes
