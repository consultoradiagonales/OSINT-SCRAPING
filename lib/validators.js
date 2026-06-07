/**
 * Validadores para DNI y datos argentinos
  */

/**
 * Valida que un DNI tenga formato correcto
  * @param {string} dni - Número de DNI sin puntos ni guiones
   * @returns {boolean} true si es válido
    */
function validateDNI(dni) {
    // Remover espacios y caracteres especiales
  const cleanDNI = dni.toString().replace(/[^0-9]/g, '');

    // Debe tener 7 u 8 dígitos
  if (cleanDNI.length < 7 || cleanDNI.length > 8) {
        return false;
  }

      // No debe ser todo ceros
    if (cleanDNI === '0000000' || cleanDNI === '00000000') {
          return false;
    }

        // Solo números
      if (!/^\d+$/.test(cleanDNI)) {
            return false;
      }

          return true;
}

  /**
   * Valida formato de CUIL
    * @param {string} cuil - CUIL en formato XX-XXXXXXXX-X
     * @returns {boolean}
      */
  function validateCUIL(cuil) {
    const cleanCUIL = cuil.toString().replace(/[^0-9]/g, '');
    return cleanCUIL.length === 11 && /^\d+$/.test(cleanCUIL);
  }

    /**
     * Formatea DNI para mostrar
      * @param {string} dni - DNI sin formato
       * @returns {string} DNI formateado (ej: 12.345.678)
        */
    function formatDNI(dni) {
      const clean = dni.toString().replace(/[^0-9]/g, '');

      if (clean.length === 8) {
        return `${clean.substring(0, 2)}.${clean.substring(2, 5)}.${clean.substring(5)}`;
      } else if (clean.length === 7) {
        return `${clean.substring(0, 1)}.${clean.substring(1, 4)}.${clean.substring(4)}`;
      }

          return clean;
    }

      /**
       * Formatea CUIL para mostrar
        * @param {string} cuil - CUIL sin formato
         * @returns {string} CUIL formateado (ej: 20-12345678-9)
          */
      function formatCUIL(cuil) {
        const clean = cuil.toString().replace(/[^0-9]/g, '');

        if (clean.length === 11) {
          return `${clean.substring(0, 2)}-${clean.substring(2, 10)}-${clean.substring(10)}`;
        }

            return clean;
      }

        /**
         * Obtiene tipo de documento de CUIL
          * @param {string} cuil - CUIL
           * @returns {string} 'DNI' | 'CI' | 'LE' | 'Desconocido'
            */
        function getDocTypeFromCUIL(cuil) {
          const prefix = cuil.toString().substring(0, 2);

          const docTypes = {
                '20': 'DNI',
                '23': 'DNI',
                '24': 'DNI',
                '25': 'DNI',
                '26': 'DNI',
                '27': 'DNI',
                '30': 'CI',
                '33': 'CI',
                '34': 'CI',
                '35': 'CI',
                '36': 'CI',
                '37': 'CI'
          };

          return docTypes[prefix] || 'Desconocido';
        }

          module.exports = {
              validateDNI,
              validateCUIL,

           
           /**
            * Calculate CUIL verification digit using AFIP modulo 11 algorithm
             */
           function calculateCUILVerificationDigit(prefix, dni) {
              // Combine prefix and DNI: XX + XXXXXXXX
              const cuilBase = prefix + dni.padStart(8, '0');
              const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
              
              let sum = 0;
              for (let i = 0; i < cuilBase.length; i++) {
                   sum += parseInt(cuilBase[i]) * multipliers[i];
              }
              
              const remainder = sum % 11;
              let verifier = 11 - remainder;
              
              if (verifier === 11) verifier = 0;
              if (verifier === 10) verifier = 9;
              
              return verifier;
           }
           
           /**
            * Convert DNI to CUIL with correct verification digit
             */
           function dniToCUIL(dni) {
             if (!validarDNI(dni)) return null;
             
             const cleanDNI = dni.replace(/[.-]/g, '');
             const prefix = '27'; // Asumir femenino por defecto (puede optimizarse)
             const verifier = calculateCUILVerificationDigit(prefix, cleanDNI);
             
             return `${prefix}-${cleanDNI}-${verifier}`;
          }

/**
 * Intelligent reverse lookup - find name/surname from DNI using public sources
  * This simulates querying public registries that index by DNI
   */
function reverseIntelligence(dni) {
   // Base de datos simulada de nombres encontrados en fuentes públicas
   // En producción, esto se conectaría a APIs públicas como:
   // - Boletines oficiales indexados por DNI
   // - Registros educativos públicos
   // - Registros de empresas (AFIP)
   
   const publicRegistry = {
        '27616030': { nombre: 'DEBORA', apellido: 'GENAZZINI', fuente: 'UNICEN Padrón Graduados', año: 2025 },
        '26534279': { nombre: 'JUAN', apellido: 'PÉREZ', fuente: 'Boletín Oficial', año: 2023 },
        '32923408': { nombre: 'CARLOS', apellido: 'GARCÍA', fuente: 'Registro AFIP', año: 2024 },
        '27276260': { nombre: 'MARÍA', apellido: 'RODRÍGUEZ', fuente: 'Boletín Oficial', año: 2023 },
   };
   
   if (publicRegistry[dni]) {
        return publicRegistry[dni];
   }
   
   return null; // Not found in public registries
}

/**
 * Enhanced DNI to CUIL with reverse intelligence
  */
function dniToCUILWithIntelligence(dni) {
   if (!validarDNI(dni)) return { valido: false, error: 'DNI inválido' };
   
   const cleanDNI = dni.replace(/[.-]/g, '');
   
   // Try to find identity information from public sources
   const identidad = reverseIntelligence(cleanDNI);
   
   // Determine correct prefix based on gender if available, else use 27 (female default)
   let prefix = '27';
   if (identidad && identidad.genero) {
        prefix = identidad.genero === 'M' ? '20' : '27';
   }
   
   const verifier = calculateCUILVerificationDigit(prefix, cleanDNI);
   const cuil = `${prefix}-${cleanDNI}-${verifier}`;
   
   return {
        valido: true,
        dni: cleanDNI,
        cuil: cuil,
        identidad: identidad,
        fuente: identidad ? `Inteligencia Inversa (${identidad.fuente})` : 'Cálculo algoritmo AFIP'
   };
}

formatDNI,
              formatCUIL,
                calculateCUILVerificationDigit,
   dniToCUIL,
   reverseIntelligence,
   dniToCUILWithIntelligence,
 getDocTypeFromCUIL
          };
