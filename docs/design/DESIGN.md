---
version: alpha
name: Geoteknius Web Pública B2B
description: Design system for the Spanish B2B geotechnical engineering lead-generation website.
colors:
  primary: "#1B2838"
  secondary: "#5C6675"
  tertiary: "#C45A11"
  neutral: "#F4F6F8"
  surface: "#FFFFFF"
  on-surface: "#1B2838"
  error: "#B42318"
  success: "#067647"
  info: "#175CD3"
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: "600"
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 1.25
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 1.6
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.6
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.5
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 1.4
    letterSpacing: 0.06em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 64px
  container-max: 1200px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 12px 24px
---

# Design System: Geoteknius Web Pública B2B

**Project ID:** 9787207935189076711

## 1. Visual Theme & Atmosphere

Geoteknius's public web feels **field-engineered, institutional, and conversion-focused**. It is a Spanish B2B geotechnical engineering brand that must earn trust on technical YMYL topics while converting mobile users on construction sites.

The atmosphere is **precise and grounded**, not decorative. Photography anchors the experience: drill rigs, soil cores, borehole logs, and real jobsite conditions. Layouts breathe on marketing pages but stay calm and dense on forms and calculators.

**Key characteristics:**
- Light mode only; mineral/concrete palette with one ochre accent for primary actions
- Editorial sections over card clutter; cards only for interactive modules (filters, forms, gated downloads)
- Full-bleed heroes on Home, Service, Geo-landing, and Case pages
- Mobile-first with sticky header CTAs (call, WhatsApp, budget)
- Spanish UI copy; professional tone, no hype or emoji
- WCAG 2.1 AA: contrast, visible focus, 44px touch targets

**Avoid:** purple/indigo gradients, warm cream+terracotta cliché, generic corporate handshake stock, glow effects, pill-badge spam, dark-mode-first UI.

## 2. Color Palette & Roles

### Foundations
- **Mineral Mist** (#F4F6F8) — Primary page background. Cool, concrete-like canvas.
- **Pure Field White** (#FFFFFF) — Content surfaces, form panels, header/footer bars.
- **Whisper Concrete Line** (#D8DEE6) — Borders, dividers, subtle separators.

### Text
- **Basalt Ink** (#1B2838) — Headlines, primary text, navigation default.
- **Steel Caption** (#5C6675) — Body copy, metadata, secondary labels.
- **Muted Quarry** (#8A94A3) — Placeholders, tertiary hints.

### Accent & Actions
- **Ochre Drill Accent** (#C45A11) — Sole primary CTA color: "Solicitar presupuesto", main conversion buttons, active nav underline.
- **Deep Basalt Hover** (#14202C) — Primary button hover / strong emphasis text.

### Functional
- **Success Core Sample** (#067647) — Confirmations, stock/availability positive states.
- **Alert Fault Line** (#B42318) — Validation errors, critical alerts.
- **Info Survey Blue** (#175CD3) — Informational callouts, links in body text.

### Channels
- **WhatsApp Field Green** (#25D366) — WhatsApp icon/button only, never as primary CTA fill.
- **Call Slate** (#1B2838) — Click-to-call secondary actions in header.

## 3. Typography Rules

**Headlines:** Sora Semi-Bold — engineered, modern, authoritative. Used for H1–H3, hero headlines, section titles.

**Body:** IBM Plex Sans Regular/Medium — highly readable for technical Spanish prose, form labels, FAQs.

**Technical data:** JetBrains Mono Medium — borehole counts, depths, expediente refs, accreditation numbers, calculator results.

### Hierarchy
- **Display (H1):** Sora 600, 40–48px desktop / 32–36px mobile, tight tracking.
- **Section (H2):** Sora 600, 28–32px.
- **Subsection (H3):** Sora 600, 22–24px.
- **Body:** IBM Plex Sans 400, 16–18px, line-height 1.6.
- **Meta/labels:** IBM Plex Sans 600 uppercase, 12px, letter-spacing 0.06em (e.g. "SERVICIOS", "PROVINCIA").
- **CTA buttons:** IBM Plex Sans 600, 16px.
- **Technical values:** JetBrains Mono 500, 13–14px.

## 4. Component Stylings

### Buttons
- **Primary:** Ochre Drill Accent (#C45A11) fill, white text, architectural 4px corners, comfortable padding (12px × 24px). One primary CTA per viewport.
- **Secondary:** Transparent with 1px Basalt Ink border, Basalt Ink text.
- **Tertiary/Ghost:** Text-only Basalt Ink or Info Survey Blue for inline actions.
- **Tel/WhatsApp:** Compact icon+text in header; WhatsApp uses brand green icon on neutral background, not filled green buttons.
- **Focus:** 2px Info Survey Blue outer ring. **Disabled:** 40% opacity, no hover.

### Sticky Header & Navigation
- White bar, 1px bottom border Whisper Concrete Line.
- Logo left; silo nav center (Servicios, Zonas, Proyectos, Blog, Empresa).
- Right cluster: tel, WhatsApp, primary "Presupuesto" button.
- Mobile: hamburger → full-height drawer; sticky bottom bar with Call + WhatsApp + Presupuesto on conversion pages.
- Active link: Ochre Drill Accent 2px underline.

### Footer (NAP)
- Basalt Ink background, white/light gray text.
- NAP block prominent: company name, address, phone, email, hours.
- Columns: Servicios, Zonas, Empresa, Legal (privacidad, cookies, aviso legal).

### Cards & Containers
- Default marketing sections: NO cards — use tonal layers and spacing.
- Cards allowed for: case study tiles, resource cards, filter panels, form steps, calculator result panel, team member tiles.
- Style: Pure Field White background, 1px Whisper Concrete Line border OR whisper-soft shadow (0 2px 8px rgba(27,40,56,0.06)), 8px corners, 24px internal padding.

### Forms (Presupuesto, Licitaciones, Recursos gated)
- Single column on mobile; max-width 640px centered on desktop for wizard.
- Labels above fields; helper text in Steel Caption.
- Inputs: 1px Whisper Concrete Line border, 8px corners, 12px padding, Mineral Mist background → white on focus.
- Focus border: Info Survey Blue; error border: Alert Fault Line + role="alert" message below.
- Progress bar for 3-step budget wizard: Ochre fill on Whisper Concrete track.
- Sticky submit CTA on mobile.

### Accordion (FAQs)
- Full-width rows, 1px dividers.
- Question: IBM Plex Sans 600, 16px; chevron right.
- Answer always in DOM; body 16px Steel Caption tone for readability.

### Thank You Pages
- Centered confirmation layout, noindex feel (simple, calm).
- Large check icon in Success Core Sample.
- Reference number in JetBrains Mono inside subtle bordered panel.
- Secondary links: casos, calculadora, blog.

### Location Widget (floating)
- Circular Ochre floating button bottom-right on mobile (above sticky bar).
- Opens dialog: map placeholder, catastral ref field, email/phone, submit.
- Dialog: white panel, focus trap, close X.

### Cookie Banner
- Bottom bar, white surface, shadow.
- Buttons: Accept (primary ochre), Reject (secondary), Configure (ghost).

## 5. Layout Principles

- **Mobile-first;** breakpoints: mobile <768px, tablet 768–1024px, desktop >1024px.
- **Max content width:** 1200px centered; heroes can be full-bleed edge-to-edge.
- **Spacing scale:** 4px base — 8/16/24/32/64px rhythm between elements/sections.
- **Grid:** 12-column desktop; 4-column mobile. Case/blog grids: 1 col mobile, 2 tablet, 3 desktop.
- **Hero pattern:** Full-bleed photo + dark gradient overlay; brand + H1 + one sentence + CTA group left-aligned (centered on mobile).
- **Conversion pages:** Reduce visual noise; left content / right form on desktop where applicable.
- **Touch targets:** minimum 44×44px.

## 6. Design System Notes for Stitch Generation

### Atmosphere phrases
- "Field-engineered institutional trust with mineral/concrete palette"
- "Full-bleed geotechnical photography with calm conversion clarity"
- "Architectural 4px corners, not playful pills"
- "Cards only for interactive modules, not for hero marketing blocks"

### Color cheat sheet
- Primary CTA: Ochre Drill Accent (#C45A11)
- Background: Mineral Mist (#F4F6F8) / Pure Field White (#FFFFFF)
- Text: Basalt Ink (#1B2838) / Steel Caption (#5C6675)
- Borders: Whisper Concrete Line (#D8DEE6)

### Screen prompt snippets

**Public layout shell:** Sticky white header with silo nav, tel, WhatsApp, Presupuesto CTA; footer with NAP and legal links; Spanish labels; mobile drawer + sticky contact bar.

**Home (/):** Full-bleed rig photo hero, brand Geoteknius, headline about estudios geotécnicos en España, three persona paths (P1 calculadora/presupuesto, P2 zonas/casos, P3 acreditaciones/licitaciones), featured services, social proof (cases + ENAC), single primary CTA.

**Service template (/servicios/[slug]):** Breadcrumbs, H1 service name, methodology steps, normativa CTE, equipment, deliverables, embedded FAQs accordion, linked cases/zones, contextual presupuesto CTA with servicio preselected.

**Geo-landing (/zonas/[slug]):** Local geology context, cases in zone, machinery, map area, CTA with provincia preselected.

**Budget wizard (/presupuesto):** 3-step progress (servicio+provincia → proyecto → contacto), Turnstile placeholder, RGPD checkbox, sticky mobile CTA.

**Calculator (/calculadora):** Inputs tipo obra/plantas/superficie/provincia, result panel with sondeos/profundidad/ensayos in mono font, NO price, CTA to presupuesto.

**Tenders (/licitaciones):** Classification table, public projects, form with expediente OR plataforma URL.

**Thank You (/gracias/presupuesto):** Confirmation, reference number, next steps, noindex calm layout.

### Iteration rules
1. Change one component or section per edit prompt.
2. Always reference descriptive color names + hex.
3. Keep Spanish UI copy.
4. Never introduce admin/portal UI in this project.

## Do's and Don'ts

- Do use one Ochre primary CTA per screen.
- Do show real field/geology context in imagery.
- Do keep forms accessible with visible labels and errors.
- Don't use purple gradients or generic SaaS aesthetics.
- Don't wrap hero content in cards.
- Don't use Inter, Roboto, or Arial.
- Don't design /admin or login screens in this project.
