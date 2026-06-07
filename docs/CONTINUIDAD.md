# Nota de continuidad - OSINT-SCRAPING

Fecha: 2026-06-07

## Donde quedamos

El proyecto quedo publicado en:

https://github.com/consultoradiagonales/OSINT-SCRAPING

Commit actual sincronizado:

`1f23fd8 Harden OSINT workflow and human verification checkpoint`

## Estado funcional

La app local principal corre con:

```bash
npm install
npm run demo
```

Pantallas:

- `http://localhost:4321/` - Demo BCRA OSINT.
- `http://localhost:4321/bandeja` - Bandeja OSINT unificada.
- `http://localhost:4321/visor` - Visor de resultados BCRA.

Motor OSINT general:

```bash
npm run osint
```

- `http://localhost:4317/osint`

## Que ya esta hecho

- Consulta por DNI, CUIT, CUIL o CDI.
- Derivacion automatica de variantes CUIT/CUIL desde DNI.
- Consulta a API publica BCRA.
- Cache de ultimo resultado valido cuando BCRA no responde.
- Bandeja OSINT con identidad derivada, BCRA, dorks, hallazgos, caveats, confianza y exportacion JSON/TXT.
- Registro de evidencia local en `exportados/` y `tools/osint-data/`.
- Tests Playwright actualizados al flujo real del producto.
- `LEGAL.md` saneado.
- `.env.example` saneado.
- Supabase sin credenciales hardcodeadas.
- Checkpoint humano para CAPTCHA/Cloudflare: detecta validacion, captura evidencia si se configura, pausa y espera resolucion manual.

## Decision tecnica importante

No se implemento bypass automatico de CAPTCHA. El archivo `lib/captcha-solver.js` quedo como checkpoint humano asistido, no como integracion 2captcha. Esto mantiene el proyecto en el camino de fuentes abiertas, APIs publicas y controles humanos cuando una fuente exige verificacion.

## Ultima validacion

Se ejecuto:

```bash
npm.cmd test
```

Resultado:

`7 passed`

## Pendientes recomendados

1. Mejorar el reporte de la bandeja con secciones imprimibles tipo informe comercial.
2. Agregar importacion de PDFs/boletines y extraccion automatica de contexto.
3. Integrar buscador configurable: Google Custom Search, SerpAPI, Brave Search o DuckDuckGo HTML, segun clave disponible.
4. Agregar historial visual por identificador.
5. Agregar cola de fuentes: BCRA, boletines oficiales, documentos, compras, judicial, redes y archivo web.
6. Mejorar normalizacion de nombres y deteccion de homonimos.
7. Agregar exportacion PDF.

## Comando para retomar

```bash
cd "C:\Users\FAMILIA\Documents\WEB CONSULTORA DIAGONALES\OSINT-SCRAPING"
git pull origin main
npm install
npm run demo
```

Luego abrir:

`http://localhost:4321/bandeja`
