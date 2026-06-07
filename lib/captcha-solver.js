/**
 * Human verification checkpoint for Playwright connectors.
 *
 * This module intentionally does not bypass CAPTCHA or anti-abuse controls.
 * It detects common verification pages, captures evidence, and pauses so an
 * operator can complete the challenge in the visible browser.
 */

const fs = require("node:fs/promises");
const path = require("node:path");

const CAPTCHA_PATTERNS = [
  /captcha/i,
  /recaptcha/i,
  /turnstile/i,
  /cloudflare/i,
  /verifique que es un ser humano/i,
  /verify you are human/i,
  /checking your browser/i,
  /incident id/i,
  /request unsuccessful/i
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pageHasHumanVerification(page) {
  const text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  const frameUrls = page.frames().map(frame => frame.url()).join("\n");
  const content = `${text}\n${frameUrls}`;
  return CAPTCHA_PATTERNS.some(pattern => pattern.test(content));
}

class HumanVerificationCheckpoint {
  constructor(page, options = {}) {
    this.page = page;
    this.timeoutMs = Number(options.timeoutMs || process.env.HUMAN_VERIFICATION_TIMEOUT_MS || 180000);
    this.pollMs = Number(options.pollMs || process.env.HUMAN_VERIFICATION_POLL_MS || 2000);
    this.evidenceDir = options.evidenceDir || process.env.HUMAN_VERIFICATION_EVIDENCE_DIR || "";
  }

  async captureEvidence(label = "human-verification") {
    if (!this.evidenceDir) return null;
    await fs.mkdir(this.evidenceDir, { recursive: true });
    const file = path.join(this.evidenceDir, `${new Date().toISOString().replace(/[:.]/g, "-")}-${label}.png`);
    await this.page.screenshot({ path: file, fullPage: true }).catch(() => null);
    return file;
  }

  async waitForHumanResolution(options = {}) {
    const startedAt = new Date().toISOString();
    const evidencePath = await this.captureEvidence(options.label || "human-verification");
    const deadline = Date.now() + Number(options.timeoutMs || this.timeoutMs);

    while (Date.now() < deadline) {
      if (!(await pageHasHumanVerification(this.page))) {
        return {
          status: "resolved_by_human",
          startedAt,
          finishedAt: new Date().toISOString(),
          evidencePath
        };
      }
      await sleep(Number(options.pollMs || this.pollMs));
    }

    return {
      status: "timeout_waiting_human",
      startedAt,
      finishedAt: new Date().toISOString(),
      evidencePath
    };
  }

  async guard(action, options = {}) {
    const before = await pageHasHumanVerification(this.page);
    if (before) return this.waitForHumanResolution(options);

    const result = typeof action === "function" ? await action() : null;
    const after = await pageHasHumanVerification(this.page);
    if (!after) return { status: "no_human_verification", result };

    const checkpoint = await this.waitForHumanResolution(options);
    return { ...checkpoint, result };
  }
}

module.exports = {
  CAPTCHA_PATTERNS,
  HumanVerificationCheckpoint,
  pageHasHumanVerification
};
