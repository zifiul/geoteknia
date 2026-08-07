# Tasks — gtk-78-cms-tiptap-editor

## 0. Rama

- [x] 0.1 Trabajar en rama `feature/cms-gtk-78-tiptap-editor`

## Implementación

- [x] 1.1 Instalar TipTap MIT y crear `lib/content/tiptap-extensions.ts`
- [x] 1.2 Extraer allowlist y sanitizers servidor/cliente
- [x] 1.3 Crear `RichTextToolbar`, `RichTextContent` y reescribir `BodyEditor`
- [x] 1.4 Adaptar render público (servicio, zona, intersección, FAQ, blog)
- [x] 1.5 Sanitizar `PreviewPane` y añadir preview intersección/FAQ
- [x] 1.6 Alinear `buildBodyWithHeadings` con HTML válido
- [x] 1.7 Script `scripts/gtk-78-plaintext-to-html.ts`

## Pasos obligatorios (openspec-tasks-mandatory-steps.md)

- [x] N. Revisar tests existentes (GTK-73 E2E, GTK-74 merge IA)
- [ ] N+1. Ejecutar Vitest + informe en `reports/`
- [ ] N+2. curl endpoints (N/A — sin APIs nuevas)
- [ ] N+3. Playwright E2E CMS (GTK-73)
- [ ] N+4. Actualizar `frontend-standards.md` §8.3
