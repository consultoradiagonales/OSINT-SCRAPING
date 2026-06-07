# OSINT-SCRAPING

Proyecto de automatizacion OSINT para Consultora Diagonales.

El objetivo es consultar fuentes abiertas, registrar evidencia y construir reportes verificables sin comprar bases de datos privadas ni evadir controles anti-abuso.

## Incluye

- Frontend local para consultar BCRA por CUIT/CUIL/CDI o DNI.
- Derivacion automatica de CUIT/CUIL posibles desde DNI.
- Consulta a la API publica de BCRA Central de Deudores.
- Cache de ultimo resultado valido cuando BCRA esta en mantenimiento.
- Registro de evidencia JSON, reporte OSINT, fecha, fuente, confianza y caveats.
- Motor OSINT ampliable para fuentes abiertas, buscadores, boletines, documentos y fuentes oficiales.
- Conectores asistidos con Playwright para navegar, completar formularios y pausar ante validaciones humanas.
- Checkpoint humano para CAPTCHA/validaciones anti-abuso, con captura de evidencia y continuacion asistida.

## Comandos

```bash
npm install
npm run demo
```

Abrir:

- `http://localhost:4321/` para BCRA OSINT Demo.
- `http://localhost:4321/bandeja` para la bandeja OSINT unificada.
- `http://localhost:4321/visor` para visualizar resultados.

Motor OSINT general:

```bash
npm run osint
```

Abrir:

- `http://localhost:4317/osint`

## Politica tecnica

El sistema automatiza navegacion, scraping permitido, consultas a APIs publicas, extraccion y registro de evidencia. Si una fuente exige CAPTCHA, login, validacion humana o bloqueo anti-abuso, el conector debe pausar y esperar intervencion humana. No se implementan bypasses automaticos de CAPTCHA.

El archivo `lib/captcha-solver.js` es un checkpoint asistido: detecta validaciones humanas, captura evidencia y espera resolucion manual en navegador visible.

## Evidencia local

Los resultados se guardan en:

- `exportados/bcra/`
- `tools/osint-data/`

Esas carpetas estan ignoradas por Git para no subir datos personales, consultas de prueba ni evidencia sensible.

## Bandeja OSINT

La bandeja ejecuta una consulta unica y devuelve:

- Identidad derivada desde DNI/CUIT.
- Variantes CUIT/CUIL calculadas.
- Resultado BCRA si la API responde o si existe cache valido.
- Google dorks listos para abrir.
- Modulos, hallazgos, caveats y confianza.
- Reporte JSON local y descarga TXT/JSON desde el navegador.
