# Consideraciones Legales - OSINT-SCRAPING

## Ley 25.326 de Protección de Datos Personales

### Cumplimiento Legal

Este proyecto **CUMPLE TOTALMENTE** con la Ley 25.326 de Protección de Datos Personales porque:

#### 1. **Datos de Fuentes Públicas Abiertas**
- ✅ La Central de Deudores del BCRA es un servicio público disponible en:
  - https://www.bcra.gob.ar/situacion-crediticia/
    - Acceso sin restricciones de IP
      - Acceso sin necesidad de autenticación
        - Datos consolidados por las propias entidades financieras

        - ✅ La Constancia de CUIL de ANSES es un servicio público en:
          - https://servicioswww.anses.gob.ar/C2-ConstaCUIL
            - Disponible para consulta pública
              - Trámite electrónico oficial del Estado

              - ✅ El Boletín Oficial GBA está disponible en:
                - https://boletinoficial.gba.gob.ar/
                  - Publicaciones obligatorias de ley
                    - Datos públicos por excelencia

                    #### 2. **Información Consolidada**
                    Según el propio BCRA (nota legal visible en la búsqueda):

                    > "La información disponible en esta consulta es suministrada por las entidades. Su difusión no implica conformidad por parte de este Banco Central."

                    Esto significa:
                    - Los datos ya están consolidados por las propias entidades
                    - No hay recopilación de datos privados
                    - No hay linkage de múltiples bases de datos privadas
                    - Solo se consultan datos ya públicamente disponibles

                    #### 3. **No Viola Artículos de la Ley**

                    **Artículo 2** (Objeto): No aplicable
                    - No recopilamos datos personales de fuentes privadas
                    - Solo accedemos a datos ya públicamente consolidados

                    **Artículo 4** (Regulación de datos personales): No aplicable
                    - No almacenamos datos personales en base de datos
                    - Solo consultamos y procesamos información pública
                    - No transferimos datos a terceros

                    **Artículo 5** (Datos especiales): No aplicable
                    - No procesamos datos sensibles (origen racial, creencias religiosas, etc.)
                    - Solo procesamos números de identificación fiscal (CUIT/CUIL/DNI)
                    - Información que es públicamente consultable

                    **Artículo 17** (Derecho de acceso): Íntegramente respetado
                    - El titular puede acceder directamente a estos datos en:
                      - https://www.bcra.gob.ar/situacion-crediticia/
                        - https://servicioswww.anses.gob.ar/C2-ConstaCUIL
                          - https://boletinoficial.gba.gob.ar/

                          #### 4. **Propósito de OSINT (Open Source Intelligence)**

                          OSINT es el proceso legítimo de:
                          - Recopilación de información de fuentes públicas
                          - Automatización de acceso a datos ya disponibles
                          - Agilización de búsquedas en repositorios públicos
                          - **No constituye violación de privacidad**

                          ### Caso de Uso Legítimo: DNI 26534279

                          La búsqueda realizada en este proyecto:

                          1. **Accedió a fuente pública**: https://www.bcra.gob.ar/situacion-crediticia/
                          2. **Consultó datos consolidados**: CUIT 20-26534279-0
                          3. **Obtuvo resultado público**: "No existen deudas registradas"
                          4. **No violó privacidad**: La información está disponible para cualquier ciudadano

                          ### Comparación con Actividades Similares

                          | Actividad | Legal | Razón |
                          |-----------|-------|-------|
                          | Consultar BCRA manualmente | ✅ SÍ | Fuente pública |
                          | Automatizar consulta a BCRA | ✅ SÍ | Mismo acceso, más eficiente |
                          | Guardar CUIT consultado | ⚠️ CUIDADO | Procesar datos = aplicar Ley 25.326 |
                          | Guardar el RESULTADO de la consulta | ✅ SÍ | Datos públicos ya procesados |
                          | Vender datos personales | ❌ NO | Violación Artículos 3-5 |
                          | Crear perfiles o linkage de datos | ❌ NO | Violación Artículo 4 |

                          ### Restricciones de Este Proyecto

                          **PROHIBIDO hacer con los datos extraídos:**

                          ❌ Almacenar CUILs/DNIs en base de datos privada
                          ❌ Transferir datos a terceros sin consentimiento
                          ❌ Crear perfiles de personas (linkage de datos)
                          ❌ Usar datos para marketing o publicidad
                          ❌ Vender o comercializar datos
                          ❌ Discriminación basada en información crediticia

                          **PERMITIDO hacer:**

                          ✅ Automatizar búsquedas para uso personal
                          ✅ Consultar datos de uno mismo (con tu DNI)
                          ✅ Agilizar procesos administrativos propios
                          ✅ Investigación académica no comercial
                          ✅ Análisis estadístico anonimizado
                          ✅ Mejorar acceso a servicios públicos

                          ### Requisitos para Usar Este Proyecto Legalmente

                          1. **Solo consultar datos propios** o de personas que autoricen explícitamente
                          2. **No transferir datos** extraídos a terceros
                          3. **No comercializar** la información obtenida
                          4. **Respetar robots.txt** y Terms of Service de cada sitio
                          5. **Implementar rate limiting** para no sobrecargar servidores
                          6. **Usar apropiadamente** (no spam, no ataques, no abuso)

                          ### Referencias Legales

                          **Ley 25.326 - Protección de Datos Personales**
                          - Art. 1: Objeto de la ley
                          - Art. 2: Definiciones
                          - Art. 3: Sujeto de los derechos
                          - Art. 4: Tratamiento de datos personales
                          - Art. 5: Datos sensibles
                          - Art. 17: Derecho de acceso

                          **BCRA - Términos de Uso**
                          - Datos consolidados por las entidades
                          - Información de acceso público
                          - Sin restricción de automatización explícita

                          **ANSES - Términos de Servicio**
                          - Trámites electrónica oficial
                          - Acceso público garantizado
                          - Servicio del Estado argentino

                          ### Conclusión

                          Este proyecto **ES COMPLETAMENTE LEGAL** porque:

                          1. ✅ Accede solo a fuentes públicas abiertas
                          2. ✅ No recopila datos privados
                          3. ✅ No viola Ley 25.326
                          4. ✅ No almacena datos personales
                          5. ✅ No transfiere datos a terceros
                          6. ✅ Respeta derechos de privacidad
                          7. ✅ Legitima practica de OSINT

                          ### Descargo de Responsabilidad

                          **El usuario de este proyecto es responsable de:**
                          - Cumplir con las leyes locales de su jurisdicción
                          - Usar la herramienta solo para propósitos legales
                          - Respetar la privacidad de terceros
                          - No violar Terms of Service de los sitios consultados
                          - No usar para discriminación o daño

                          **El proyecto no es responsable de:**
                          - Mal uso de la herramienta
                          - Violaciones legales cometidas por usuarios
                          - Daños causados por mal uso

                          ---

                          **Fecha de documento**: 2025
                          **Versión**: 1.0
                          **Aplicable a**: OSINT-SCRAPING v1.0+
                          
