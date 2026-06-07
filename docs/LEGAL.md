# Consideraciones Legales - OSINT-SCRAPING

Este proyecto esta pensado para investigacion OSINT sobre fuentes abiertas, consultas a APIs publicas y registro trazable de evidencia.

## Principios

- Usar fuentes publicas o autorizadas.
- Registrar fecha, fuente, URL, identificador consultado, resultado, confianza y caveats.
- Evitar scraping agresivo, evasion de controles anti-abuso, uso de credenciales ajenas o compra de bases privadas.
- Separar hechos observados de inferencias analiticas.
- Validar la fuente primaria antes de tomar decisiones sensibles.

## Datos Personales

Argentina cuenta con la Ley 25.326 de Proteccion de Datos Personales. Aunque una fuente sea publica, el tratamiento posterior de datos personales requiere finalidad legitima, proporcionalidad, exactitud, seguridad y trazabilidad.

Este repositorio no debe usarse para:

- Hostigamiento, doxxing o vigilancia indiscriminada.
- Acceso no autorizado a sistemas.
- Evasion de CAPTCHA, login, paywall, rate-limit o bloqueo anti-abuso.
- Publicacion innecesaria de datos personales.
- Toma automatica de decisiones con efectos legales o crediticios sin revision humana.

## BCRA

La Central de Deudores del BCRA y su API publica pueden utilizarse como fuente primaria cuando esten disponibles. La informacion debe interpretarse con cautela:

- Validar el periodo informado.
- Registrar si el resultado provino de respuesta en vivo o cache local.
- No interpretar fallas de conexion como ausencia de deuda.
- Conservar caveats y evidencia tecnica.

## Validaciones Humanas

Si una fuente exige CAPTCHA, validacion humana, login o control anti-abuso, los conectores deben pausar y esperar intervencion humana. El modulo `lib/captcha-solver.js` implementa un checkpoint asistido, no un bypass automatico.

## Evidencia

Los artefactos locales se guardan en carpetas ignoradas por Git:

- `exportados/`
- `tools/osint-data/`
- `test-results/`
- `playwright-report/`

No subir evidencia con datos personales al repositorio publico.

## Uso Recomendado

1. Definir objetivo y base legitima de la consulta.
2. Consultar fuentes abiertas y oficiales.
3. Guardar evidencia con fecha y URL.
4. Calcular confianza y caveats.
5. Revisar manualmente antes de emitir conclusiones.
