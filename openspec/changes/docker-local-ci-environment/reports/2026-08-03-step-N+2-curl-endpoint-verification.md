# Informe Step N+2 - Verificación curl

- Fecha: 2026-08-03
- Cambio: docker-local-ci-environment

## Comandos ejecutados

```powershell
curl.exe -s -o NUL -w "Home: %{http_code}" http://localhost:3000/
curl.exe -s -o NUL -w "Admin: %{http_code}" http://localhost:3000/admin
```

## Resultados

- `GET /` → **200** (contenedor web healthy)
- `GET /admin` → **307** (redirección a login, esperado)

## Resultado

- Estado del paso N+2: PASS
