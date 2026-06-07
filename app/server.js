const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { queryBcraWrapper, bcraHealthCheck } = require("./bcra-wrapper-client");

const PORT = Number(process.env.PORT || 4321);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "exportados", "bcra");
const LOG_FILE = path.join(ROOT, "tools", "osint-data", "bcra-consultas.jsonl");
const REPORT_DIR = path.join(ROOT, "exportados", "osint");

let currentRun = null;

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(type.includes("json") ? JSON.stringify(body) : body);
}

function normalizeIdentifier(value) {
  return String(value || "").replace(/\D/g, "");
}

function cuitCheckDigit(prefix, dni) {
  const base = `${prefix}${dni.padStart(8, "0")}`;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = base.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const mod = 11 - (sum % 11);
  if (mod === 11) return "0";
  if (mod === 10) return null;
  return String(mod);
}

function cuitVariantsFromDni(value) {
  const numeric = normalizeIdentifier(value);
  if (!/^\d{7,8}$/.test(numeric)) return [];
  const dni = numeric.padStart(8, "0");
  return [...new Set(["20", "23", "24", "27", "30", "33", "34"].map(prefix => {
    const check = cuitCheckDigit(prefix, dni);
    return check ? `${prefix}${dni}${check}` : null;
  }).filter(Boolean))];
}

function formatCuit(value) {
  const numeric = normalizeIdentifier(value);
  return /^\d{11}$/.test(numeric) ? `${numeric.slice(0, 2)}-${numeric.slice(2, 10)}-${numeric.slice(10)}` : numeric;
}

function buildDorks(subject) {
  const quoted = subject.terms.map(term => `"${term}"`);
  const base = quoted.join(" OR ");
  return [
    { layer: "General", query: base },
    { layer: "Fuentes oficiales", query: `${base} site:gov.ar OR site:gob.ar OR site:argentina.gob.ar` },
    { layer: "Boletines y documentos", query: `${base} ("Boletin Oficial" OR edicto OR sociedad OR filetype:pdf OR filetype:xls)` },
    { layer: "Judicial", query: `${base} (causa OR sentencia OR expediente OR juzgado OR concurso OR quiebra OR embargo)` },
    { layer: "Contrataciones", query: `${base} (licitacion OR contratacion OR proveedor OR adjudicacion OR compras)` },
    { layer: "Redes", query: `${base} (site:linkedin.com OR site:facebook.com OR site:instagram.com OR site:x.com)` }
  ];
}

function buildSubject(identifier, bcraRecord) {
  const numeric = normalizeIdentifier(identifier);
  const isCuit = /^\d{11}$/.test(numeric);
  const dni = isCuit ? numeric.slice(2, 10).replace(/^0+/, "") : numeric;
  const variants = isCuit ? [numeric] : cuitVariantsFromDni(numeric);
  const denomination = bcraRecord?.result?.denominacion || "";
  const terms = [...new Set([
    numeric,
    dni,
    ...variants,
    ...variants.map(formatCuit),
    denomination
  ].filter(Boolean))];
  return { input: identifier, numeric, dni, variants, denomination, terms };
}

function buildOsintReport(subject, bcraRecord) {
  const now = new Date().toISOString();
  const dorks = buildDorks(subject);
  const findings = [];
  let confidence = "Baja";
  let signal = "sin_resultado_bcra";

  if (bcraRecord?.result && bcraRecord.result.riskSignal !== "consulta_fallida") {
    confidence = bcraRecord.confidence || bcraRecord.result.confidence || "Media";
    signal = bcraRecord.result.riskSignal;
    findings.push({
      source: "BCRA Central de Deudores",
      title: `BCRA: ${bcraRecord.result.denominacion || subject.variants[0] || subject.numeric}`,
      url: bcraRecord.endpoints?.deudas || "https://api.bcra.gob.ar/centraldedeudores/v1.0",
      confidence,
      summary: `Situacion maxima: ${bcraRecord.result.maxSituation}. Entidades actuales: ${bcraRecord.result.currentEntities}. Periodos historicos: ${bcraRecord.result.historicPeriods}. Monto informado: ${bcraRecord.result.totalDebt}.`
    });
  }

  const caveats = [
    "Consulta basada en fuentes abiertas y API publica BCRA.",
    "No implica verificacion de identidad presencial.",
    "Validar fecha de periodo, homonimos y fuente primaria antes de tomar decisiones."
  ];

  return {
    generatedAt: now,
    subject,
    status: findings.length ? "con_hallazgos" : "sin_hallazgos_confirmados",
    confidence,
    signal,
    modules: [
      {
        id: "identity",
        name: "Identidad derivada",
        status: subject.variants.length ? "ok" : "insuficiente",
        summary: subject.variants.length
          ? `DNI ${subject.dni || "-"} con variantes CUIT/CUIL: ${subject.variants.map(formatCuit).join(", ")}.`
          : "No se pudieron derivar variantes CUIT/CUIL desde el identificador ingresado."
      },
      {
        id: "bcra",
        name: "BCRA",
        status: findings.length ? "ok" : "requiere_reintento",
        summary: findings[0]?.summary || "BCRA no respondio con dato util en esta ejecucion."
      },
      {
        id: "search",
        name: "Buscadores y documentos",
        status: "preparado",
        summary: `${dorks.length} busquedas listas para Google/OSINT launcher.`
      }
    ],
    dorks,
    findings,
    caveats,
    evidence: {
      bcraRawJsonPath: bcraRecord?.evidence?.rawJsonPath || "",
      bcraReportPath: bcraRecord?.evidence?.reportPath || ""
    }
  };
}

async function readJsonLines(file) {
  const content = await fs.readFile(file, "utf8").catch(() => "");
  if (!content.trim()) return [];
  return content.trim().split(/\r?\n/).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

async function listArtifacts() {
  const files = await fs.readdir(OUT_DIR).catch(() => []);
  const records = await readJsonLines(LOG_FILE);
  const usefulRecords = records.filter(record =>
    record.result?.riskSignal !== "consulta_fallida" &&
    !record.result?.deudas?.error
  );
  return {
    records: usefulRecords.slice(-20).reverse(),
    files: files
      .filter(name => name.includes(".wrapper.osint.json"))
      .sort()
      .reverse()
      .slice(0, 40)
      .map((name) => ({
      name,
      path: path.join(OUT_DIR, name)
    }))
  };
}

function runBcra(identifier) {
  const child = spawn(
    process.execPath,
    [path.join(ROOT, "tools", "consulta-bcra-cuit.js"), identifier],
    { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }
  );

  currentRun = {
    id: `${Date.now()}`,
    identifier,
    status: "running",
    startedAt: new Date().toISOString(),
    output: []
  };

  child.stdout.on("data", (chunk) => {
    currentRun.output.push(chunk.toString());
  });
  child.stderr.on("data", (chunk) => {
    currentRun.output.push(chunk.toString());
  });
  child.on("exit", (code) => {
    currentRun.status = code === 0 ? "finished" : "failed";
    currentRun.exitCode = code;
    currentRun.finishedAt = new Date().toISOString();
  });

  currentRun.enter = () => {
    child.stdin.write("\n");
  };

  return currentRun;
}

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") return send(res, 200, {});

  if (url.pathname === "/" && req.method === "GET") {
    const html = await fs.readFile(path.join(__dirname, "index.html"), "utf8");
    return send(res, 200, html, "text/html; charset=utf-8");
  }

  if (url.pathname === "/resultados" && req.method === "GET") {
    const html = await fs.readFile(path.join(__dirname, "resultados.html"), "utf8");
    return send(res, 200, html, "text/html; charset=utf-8");
  }

  if (url.pathname === "/visor" && req.method === "GET") {
    const html = await fs.readFile(path.join(__dirname, "visor.html"), "utf8");
    return send(res, 200, html, "text/html; charset=utf-8");
  }

  if (url.pathname === "/bandeja" && req.method === "GET") {
    const html = await fs.readFile(path.join(__dirname, "bandeja.html"), "utf8");
    return send(res, 200, html, "text/html; charset=utf-8");
  }

  if (url.pathname === "/api/run" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const payload = JSON.parse(body || "{}");
      const identifier = normalizeIdentifier(payload.identifier);
      if (!/^\d{11}$/.test(identifier)) {
        return send(res, 400, { error: "Ingresar CUIT/CUIL/CDI de 11 digitos." });
      }
      if (currentRun?.status === "running") {
        return send(res, 409, { error: "Ya hay una consulta en curso." });
      }
      const run = runBcra(identifier);
      send(res, 200, { id: run.id, status: run.status, identifier: run.identifier });
    });
    return;
  }

  if (url.pathname === "/api/bcra-wrapper" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const record = await queryBcraWrapper(payload.identifier);
        if (record.servedFromCache) {
          send(res, 200, record);
          return;
        }
        if (record.result?.riskSignal === "consulta_fallida") {
          send(res, 502, {
            error: "BCRA corto la conexion. Reintentar en unos segundos; no interpretar como ausencia de datos.",
            record
          });
          return;
        }
        send(res, 200, record);
      } catch (error) {
        send(res, 500, { error: error.message });
      }
    });
    return;
  }

  if (url.pathname === "/api/bcra-health" && req.method === "GET") {
    return send(res, 200, await bcraHealthCheck());
  }

  if (url.pathname === "/api/bandeja-osint" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const identifier = String(payload.identifier || "").trim();
        if (!normalizeIdentifier(identifier)) return send(res, 400, { error: "Ingresar DNI, CUIT, CUIL o CDI." });

        let bcraRecord = null;
        let bcraError = null;
        try {
          bcraRecord = await queryBcraWrapper(identifier);
        } catch (error) {
          bcraError = error.message;
        }

        const subject = buildSubject(identifier, bcraRecord);
        const report = buildOsintReport(subject, bcraRecord);
        if (bcraError) {
          report.modules.find(item => item.id === "bcra").summary = bcraError;
          report.caveats.push("BCRA no respondio en vivo; reintentar o usar evidencia local si existe.");
        }

        await fs.mkdir(REPORT_DIR, { recursive: true });
        const safeId = normalizeIdentifier(identifier) || "consulta";
        const reportPath = path.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeId}.bandeja-osint.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
        report.evidence.reportPath = reportPath;

        send(res, 200, report);
      } catch (error) {
        send(res, 500, { error: error.message });
      }
    });
    return;
  }

  if (url.pathname === "/api/enter" && req.method === "POST") {
    if (!currentRun?.enter || currentRun.status !== "running") {
      return send(res, 409, { error: "No hay consulta esperando Enter." });
    }
    currentRun.enter();
    return send(res, 200, { ok: true });
  }

  if (url.pathname === "/api/status" && req.method === "GET") {
    return send(res, 200, {
      run: currentRun ? {
        id: currentRun.id,
        identifier: currentRun.identifier,
        status: currentRun.status,
        startedAt: currentRun.startedAt,
        finishedAt: currentRun.finishedAt,
        exitCode: currentRun.exitCode,
        output: currentRun.output.join("")
      } : null,
      artifacts: await listArtifacts()
    });
  }

  if (url.pathname === "/api/latest-success" && req.method === "GET") {
    const data = await listArtifacts();
    const record = data.records.find(item =>
      item.module === "bcra_wrapper_api" &&
      item.result?.riskSignal !== "consulta_fallida" &&
      !item.result?.deudas?.error
    ) || null;
    return send(res, 200, { record });
  }

  send(res, 404, { error: "No encontrado" });
}

http.createServer((req, res) => {
  handle(req, res).catch((error) => send(res, 500, { error: error.message }));
}).listen(PORT, () => {
  console.log(`Mini BCRA OSINT listo en http://localhost:${PORT}`);
});
