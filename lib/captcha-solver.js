/**
 * CAPTCHA Solver Module
 * Integración con 2captcha para resolver CAPTCHA reCAPTCHA v2/v3
   * Documentación: https://2captcha.com/api-solver
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Configuración del cliente 2captcha
 */
const CAPTCHA_CONFIG = {
    api_key: process.env.CAPTCHA_2_API_KEY || '',
        api_url: 'http://2captcha.com',
        submit_url: 'http://2captcha.com/api/upload',
        retrieve_url: 'http://2captcha.com/api/res',
        timeout: parseInt(process.env.CAPTCHA_TIMEOUT || '180') * 1000,
        polling_interval: 5000,
        max_retries: 3,
      };

/**
 * Cliente de 2captcha para resolver CAPTCHAs
 */
class CaptchaSolver {
  constructor(apiKey = CAPTCHA_CONFIG.api_key) {
    this.apiKey = apiKey || process.env.CAPTCHA_2_API_KEY;
    if (!this.apiKey) {
      throw new Error('CAPTCHA_2_API_KEY no configurada en variables de entorno');
    }
    this.client = axios.create({
            baseURL: CAPTCHA_CONFIG.api_url,
            timeout: CAPTCHA_CONFIG.timeout,
      });
  }

  /**
   * Resuelve un CAPTCHA reCAPTCHA v2
   * @param {string} siteKey - Sitekey de reCAPTCHA del sitio
   * @param {string} pageUrl - URL de la página con reCAPTCHA
   * @returns {Promise<string>} Token reCAPTCHA resuelto
   */
  async solveRecaptchaV2(siteKey, pageUrl) {
        try {
      console.log(`[CaptchaSolver] Resolviendo reCAPTCHA v2 para ${pageUrl}`);

      // Enviar CAPTCHA a resolver
      const submitResponse = await this.client.post('/api/upload', null, {
        params: {
          key: this.apiKey,
          method: 'userrecaptcha',
          googlekey: siteKey,
          pageurl: pageUrl,
          json: 1,
},
});

      if (submitResponse.data.status !== 1) {
        throw new Error(`Error al enviar CAPTCHA: ${submitResponse.data.error}`);
}

      const captchaId = submitResponse.data.captcha;
      console.log(`[CaptchaSolver] CAPTCHA enviado con ID: ${captchaId}`);

      // Esperar a que se resuelva
      return await this.pollForResult(captchaId);
} catch (error) {
      console.error('[CaptchaSolver] Error al resolver reCAPTCHA v2:', error.message);
      throw error;
}
}

  /**
   * Resuelve un CAPTCHA reCAPTCHA v3
   * @param {string} siteKey - Sitekey de reCAPTCHA v3
   * @param {string} pageUrl - URL de la página
   * @param {string} action - Acción de v3 (default: 'verify')
   * @param {number} minScore - Puntuación mínima (0.0 - 1.0)
   * @returns {Promise<string>} Token reCAPTCHA v3 resuelto
   */
  async solveRecaptchaV3(siteKey, pageUrl, action = 'verify', minScore = 0.3) {
    try {
      console.log(`[CaptchaSolver] Resolviendo reCAPTCHA v3 para ${pageUrl}`);

      const submitResponse = await this.client.post('/api/upload', null, {
        params: {
          key: this.apiKey,
          method: 'userrecaptcha',
          googlekey: siteKey,
          pageurl: pageUrl,
          version: 'v3',
          action: action,
          min_score: minScore,
          json: 1,
},
});

      if (submitResponse.data.status !== 1) {
        throw new Error(`Error al enviar CAPTCHA v3: ${submitResponse.data.error}`);
}

      const captchaId = submitResponse.data.captcha;
      console.log(`[CaptchaSolver] CAPTCHA v3 enviado con ID: ${captchaId}`);

      return await this.pollForResult(captchaId);
} catch (error) {
      console.error('[CaptchaSolver] Error al resolver reCAPTCHA v3:', error.message);
      throw error;
}
}

  /**
   * Consulta el estado de un CAPTCHA en resolución
   * @param {number} captchaId - ID del CAPTCHA
   * @returns {Promise<string>} Token del CAPTCHA resuelto
   */
  async pollForResult(captchaId) {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < CAPTCHA_CONFIG.timeout) {
      attempts++;

      try {
        const response = await this.client.get('/api/res', {
          params: {
            key: this.apiKey,
            action: 'get',
            captcha: captchaId,
            json: 1,
},
});

        if (response.data.status === 1) {
          console.log(`[CaptchaSolver] CAPTCHA resuelto en intento ${attempts}`);
          return response.data.request;
          }

        if (response.data.status === 0 && response.data.request === 'CAPCHA_NOT_READY') {
          console.log(`[CaptchaSolver] CAPTCHA en resolución... intento ${attempts}`);
          await this.sleep(CAPTCHA_CONFIG.polling_interval);
          continue;
                                                  }

        // Error
        throw new Error(`Error en CAPTCHA: ${response.data.error}`);
} catch (error) {
        if (attempts >= CAPTCHA_CONFIG.max_retries) {
          throw error;
}
        console.warn(`[CaptchaSolver] Error en intento ${attempts}, reintentando...`);
        await this.sleep(2000);
                                      }
}

    throw new Error('Timeout: CAPTCHA no se resolvió en el tiempo permitido');
}

  /**
   * Sleep helper function
   * @param {number} ms - Milisegundos
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

  /**
   * Reporta un CAPTCHA incorrecto
   * @param {number} captchaId - ID del CAPTCHA
   */
  async reportBadCaptcha(captchaId) {
    try {
      const response = await this.client.get('/api/res', {
        params: {
          key: this.apiKey,
          action: 'report',
          captcha: captchaId,
          json: 1,
},
});
      console.log(`[CaptchaSolver] CAPTCHA ${captchaId} reportado como incorrecto`);
      return response.data;
                                            } catch (error) {
      console.error('[CaptchaSolver] Error al reportar CAPTCHA:', error.message);
      throw error;
}
}
}

/**
 * Wrapper de Playwright para integración automática con CAPTCHA
 */
class PlaywrightCaptchaHelper {
  constructor(page, solver) {
    this.page = page;
    this.solver = solver;
}

  /**
   * Resuelve automáticamente un reCAPTCHA en la página
   * @param {Object} options - Opciones de resolución
   * @returns {Promise<void>}
   */
  async solveAndInject(options = {}) {
    const {
      siteKeySelector = '[data-sitekey]',
      tokenInputSelector = '#g-recaptcha-response',
      formSelector = 'form',
      captchaVersion = 'v2',
      action = 'verify',
      minScore = 0.3,
} = options;

    try {
      // Obtener sitekey
      const siteKey = await this.page.getAttribute(siteKeySelector, 'data-sitekey');
      if (!siteKey) {
        throw new Error(`No se encontró sitekey con selector: ${siteKeySelector}`);
}

      console.log(`[PlaywrightCaptchaHelper] Sitekey encontrado: ${siteKey}`);

      // Resolver CAPTCHA
      let token;
      if (captchaVersion === 'v3') {
        token = await this.solver.solveRecaptchaV3(
                    siteKey,
                    this.page.url(),
                    action,
                    minScore
                  );
      } else {
        token = await this.solver.solveRecaptchaV2(siteKey, this.page.url());
      }

      console.log(`[PlaywrightCaptchaHelper] Token obtenido, inyectando en formulario...`);

      // Inyectar token en el input
      await this.page.fill(tokenInputSelector, token);

      // Ejecutar JavaScript para disparar cualquier evento de validación
      await this.page.evaluate(() => {
                const event = new Event('change', { bubbles: true });
        const input = document.querySelector('#g-recaptcha-response');
        if (input) input.dispatchEvent(event);
                                                     });

      console.log('[PlaywrightCaptchaHelper] Token inyectado exitosamente');
      return token;
} catch (error) {
      console.error('[PlaywrightCaptchaHelper] Error:', error.message);
      throw error;
}
}
}

module.exports = {
  CaptchaSolver,
  PlaywrightCaptchaHelper,
  CAPTCHA_CONFIG,
};
