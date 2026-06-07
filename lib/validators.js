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
              formatDNI,
              formatCUIL,
              getDocTypeFromCUIL
          };
