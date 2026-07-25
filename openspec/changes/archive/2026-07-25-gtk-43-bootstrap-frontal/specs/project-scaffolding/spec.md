# Delta spec — project-scaffolding

> Origen: GTK-43 — ajuste de estructura App Router respecto a GTK-21

## MODIFIED Requirements

### Requirement: Estructura App Router con frontal público y grupo (admin)
La estructura `app/` SHALL contener el frontal público bajo el route group `(public)` con home que responde 200, y un grupo de rutas `(admin)` con layout propio que aplica `noindex` por defecto, sin lógica de negocio adicional en los layouts de andamiaje.

#### Scenario: Home responde 200
- **WHEN** se arranca la aplicación y se solicita `GET /`
- **THEN** la respuesta tiene código HTTP 200

#### Scenario: No existe page.tsx en raíz de app
- **WHEN** se inspecciona el árbol `app/`
- **THEN** no existe `app/page.tsx` y existe `app/(public)/page.tsx`
