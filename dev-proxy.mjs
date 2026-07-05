import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 8787;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";
const ROLE_LOOKUP_TIMEOUT_MS = 5000;
const ENV_FILES = [".env.local", ".env"];

function loadLocalEnv() {
  ENV_FILES.forEach((fileName) => {
    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      if (!key || process.env[key]) {
        return;
      }

      process.env[key] = value.replace(/^["']|["']$/g, "");
    });
  });
}

loadLocalEnv();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function getCompanyPrompt(companyUrl) {
  return `Visit ${companyUrl}, return a JSON result with two fields:
- "industry": the company's industry in one or two broad words (e.g. "Manufacturing", "Financial Services")
- "about": a short 1-2 sentence description of what the company does`;
}

function getRolePrompt({ firstName, lastName, companyName }) {
  const personName = [firstName, lastName].filter(Boolean).join(" ");

  return `Check LinkedIn for ${personName} at ${companyName}, return a JSON result with two fields:
- "role": the person's current role or job title at the company
- "confidence": an integer from 0 to 100 showing how confident you are that the role is accurate
The first name and last name must match exactly. Do not return a role for partial, nickname, alternate spelling, or initials-only name matches.
The company name may deviate slightly if it is clearly the same organisation, such as a group name, legal suffix, regional entity, or minor punctuation difference.
Only return a role when you are at least 70% confident it is accurate.
If no current role is found or confidence is below 70, return {"role": "", "confidence": 0}.`;
}

function parseDeepSeekJson(content) {
  const trimmedContent = content.trim();
  const jsonMatch = trimmedContent.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : trimmedContent);

  return {
    industry: String(parsed.industry || "").trim(),
    about: String(parsed.about || "").trim(),
    role: String(parsed.role || "").trim(),
    confidence: Number(parsed.confidence || 0)
  };
}

async function callDeepSeek(prompt, signal) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY environment variable.");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    signal,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Return valid JSON only. Do not include markdown or extra commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_object"
      },
      stream: false
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "DeepSeek request failed.");
  }

  return parseDeepSeekJson(payload.choices?.[0]?.message?.content || "{}");
}

async function enrichCompany(companyUrl) {
  return callDeepSeek(getCompanyPrompt(companyUrl));
}

async function findRole({ firstName, lastName, companyName }) {
  if (!firstName || !companyName) {
    return "";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROLE_LOOKUP_TIMEOUT_MS);

  try {
    const result = await callDeepSeek(
      getRolePrompt({
        firstName,
        lastName,
        companyName
      }),
      controller.signal
    );

    return result.confidence >= 80 ? result.role || "" : "";
  } catch (error) {
    if (error.name === "AbortError") {
      return "";
    }

    return "";
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/enrich-company") {
    sendJson(response, 404, {
      error: "Not found."
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const companyUrl = String(body.companyUrl || "").trim();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const companyName = String(body.companyName || "").trim();

    if (!companyUrl) {
      sendJson(response, 400, {
        error: "companyUrl is required."
      });
      return;
    }

    const companyResult = await enrichCompany(companyUrl);
    const role = await findRole({
      firstName,
      lastName,
      companyName
    });

    sendJson(response, 200, {
      industry: companyResult.industry,
      about: companyResult.about,
      role
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Company enrichment failed."
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`DeepSeek dev proxy running at http://127.0.0.1:${PORT}`);
});
