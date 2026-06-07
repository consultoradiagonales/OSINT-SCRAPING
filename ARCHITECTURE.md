# OSINT-SCRAPING: Arquitectura Multi-Fuente

## Descripción General

Proyecto de automatización y scraping con Playwright para recopilación de información OSINT desde múltiples fuentes públicas argentinas.

## Fuentes de Datos Integradas

### 1. BCRA Central de Deudores
- **URL**: https://www.bcra.gob.ar/situacion-crediticia/
- **Datos**: Información de deudores, historial crediticio, situación económica
- **Tests**: `tests/central-deudores.spec.js`, `tests/scraping-deudores.spec.js`
- **Tipo**: Pública, Datos estructurados

### 2. ANSES - Constancia de CUIL
- **URL**: https://servicioswww.anses.gob.ar/C2-ConstaCUIL
- **Datos**: Información de CUIL, antecedentes, datos de beneficiarios
- **Tests**: `tests/anses-cuil.spec.js`
- **Tipo**: Pública, Requiere validación
- **Campos Extraibles**:
  - Número de CUIL
    - Nombre completo
      - Estado migratorio
        - Datos de afiliación

        ### 3. Boletín Oficial GBA
        - **URL**: https://boletinoficial.gba.gob.ar/
        - **Datos**: Decretos, resoluciones, disposiciones oficiales
        - **Tests**: `tests/boletin-oficial-gba.spec.js`
        - **Tipo**: Pública, Datos historóricos
        - **Casos de Uso**:
          - Búsqueda de normas legales
            - Seguimiento de resoluciones
              - Historial de cambios regulatorios

              ### 4. Google Scraping (SERP + Maps)
              - **APIs Soportadas**:
                - Google Search Scraper (Apify)
                  - Outscraper API
                    - Instant Data Scraper (No-Code)
                    - **Datos Extraibles**:
                      - Resultados de búsqueda (SERP)
                        - Información de empresas desde Google Maps
                          - Teléfonos, direcciones, reseñas
                          - **Tests**: `tests/google-scraping.spec.js`
                          - **Configuración**: `.env.example` con API keys

                          ## Arquitectura Técnica

                          ### Stack
                          - **Playwright**: Automatización web multi-navegador
                          - **Node.js**: Runtime JavaScript
                          - **Apify**: Plataforma de scraping as-a-service
                          - **Jest**: Framework de testing

                          ### Estructura de Carpetas

                          ```
                          OSINT-SCRAPING/
                          ├── tests/
                          │  ├── central-deudores.spec.js      # BCRA
                          │  ├── scraping-deudores.spec.js     # BCRA Scraping
                          │  ├── anses-cuil.spec.js            # ANSES CUIL
                          │  ├─┠─ boletin-oficial-gba.spec.js   # Boletín Oficial
                          │  ├─┠─ google-scraping.spec.js       # Google Search + Maps
                          │  └── humo.spec.js                  # Smoke tests
                          ├── lib/
                          │  ├── scrapers/
                          │  │  ├── anses-scraper.js
                          │  │  ├── boletin-scraper.js
                          │  │  └── google-scraper.js
                          │  ├── parsers/
                          │  │  ├── cuil-parser.js
                          │  │  ├── boletin-parser.js
                          │  │  └── google-parser.js
                          │  └── utils/
                          │     ├── validators.js
                          │     ├── formatters.js
                          │     └── api-clients.js
                          ├── config/
                          │  ├── apify-config.js
                          │  ├── google-api-config.js
                          │  └── sources.json
                          ├── data/
                          │  ├── extracts/                    # Datos extraídos
                          │  ├── cache/                      # Cache de respuestas
                          │  └── exports/                    # Datos exportados (JSON, CSV)
                          ├── docs/
                          │  ├── LEGAL.md                     # Consideraciones legales
                          │  ├── API_SETUP.md                 # Configuración de APIs
                          │  ├── TUTORIAL.md                  # Guía de uso
                          │  └── TROUBLESHOOTING.md           # Resolución de problemas
                          ├── package.json
                          ├── playwright.config.js
                          ├── .env.example
                          ├── .gitignore
                          └── README.md
                          ```

                          ## Flujo de Datos

                          ```
                          Fuente Pública
                              ↑
                                  |
                                   Playwright (Automatización)
                                       ↑
                                           |
                                             Locator (Selección de elementos)
                                                 ↑
                                                     |
                                                       Parser (Extracción de datos)
                                                           ↑
                                                               |
                                                                 Formatter (Estruturación)
                                                                     ↑
                                                                         |
                                                                           Storage (JSON, CSV, Base de datos)
                                                                           ```

                                                                           ## APIs y Servicios Externos

                                                                           ### Google Search Scraper (Apify)
                                                                           ```javascript
                                                                           const client = new ApifyClient({
                                                                             token: process.env.APIFY_TOKEN
                                                                             });

                                                                             // Buscar en Google
                                                                             const input = {
                                                                               queries: ['empresa argentina'],
                                                                                 maxPagesPerQuery: 3,
                                                                                   outputFormat: 'json'
                                                                                   };

                                                                                   const run = await client.actor('google-search-scraper').call(input);
                                                                                   ```

                                                                                   ### Outscraper API
                                                                                   ```javascript
                                                                                   const response = await fetch('https://api.outscraper.com/v2/google-maps', {
                                                                                     headers: { 'X-API-KEY': process.env.OUTSCRAPER_KEY },
                                                                                       body: JSON.stringify({
                                                                                           query: 'empresa',
                                                                                               location: 'Argentina'
                                                                                                 })
                                                                                                 });
                                                                                                 ```

                                                                                                 ## Tests Disponibles

                                                                                                 ### Ejecutar todo
                                                                                                 ```bash
                                                                                                 npm test
                                                                                                 ```

                                                                                                 ### Por fuente
                                                                                                 ```bash
                                                                                                 npm test -- --testNamePattern="BCRA"
                                                                                                 npm test -- --testNamePattern="ANSES"
                                                                                                 npm test -- --testNamePattern="Boletín"
                                                                                                 npm test -- --testNamePattern="Google"
                                                                                                 ```

                                                                                                 ### Con navegador visible
                                                                                                 ```bash
                                                                                                 npm run test:headed
                                                                                                 ```

                                                                                                 ## Consideraciones Legales y Éticas

                                                                                                 - **Terms of Service**: Verificar los ToS de cada fuente
                                                                                                 - **robots.txt**: Respetar las indicaciones de robots.txt
                                                                                                 - **Rate Limiting**: Implementar delays entre requests
                                                                                                 - **Datos Personales**: Cumplir con GDPR/LGPD
                                                                                                 - **Uso Responsable**: OSINT debe ser ético y legal

                                                                                                 ## Variables de Entorno (.env)

                                                                                                 ```
                                                                                                 # Google
                                                                                                 GOOGLE_API_KEY=your_key
                                                                                                 GOOGLE_SEARCH_ENGINE_ID=your_id

                                                                                                 # Apify
                                                                                                 APIFY_TOKEN=your_token

                                                                                                 # Outscraper
                                                                                                 OUTSCRAPER_KEY=your_key

                                                                                                 # Base de datos (opcional)
                                                                                                 DB_HOST=localhost
                                                                                                 DB_PORT=5432
                                                                                                 DB_NAME=osint_db
                                                                                                 DB_USER=user
                                                                                                 DB_PASS=pass

                                                                                                 # Proxies (opcional)
                                                                                                 PROXY_URL=http://proxy:port
                                                                                                 ```

                                                                                                 ## Contribuciones

                                                                                                 Para agregar nuevas fuentes:

                                                                                                 1. Crear archivo de test en `tests/`
                                                                                                 2. Crear scraper en `lib/scrapers/`
                                                                                                 3. Crear parser en `lib/parsers/`
                                                                                                 4. Documentar en `docs/`
                                                                                                 5. Commit y PR

                                                                                                 ## Licencia

                                                                                                 MIT - Este proyecto es de código abierto con fines educativos y de investigación.
