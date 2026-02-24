import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

const UI_ROOT = path.resolve(process.cwd(), "ui");
const DOCS_ROOT = path.resolve(process.cwd(), "docs");

const EN_PATH = path.join(UI_ROOT, "src/locales/en.json");
const ZH_PATH = path.join(UI_ROOT, "src/locales/zh-CN.json");
const TM_PATH = path.join(UI_ROOT, "src/locales/.tm.jsonl");
const GLOSSARY_PATH = path.join(DOCS_ROOT, ".i18n/glossary.zh-CN.json");

interface GlossaryEntry {
  source: string;
  target: string;
}

interface TMEntry {
  hash: string;
  source: string;
  target: string;
  updatedAt: string;
}

async function main() {
  if (!API_KEY) {
    console.error("Error: DEEPSEEK_API_KEY is not set");
    process.exit(1);
  }

  // Load Glossary
  let glossary: GlossaryEntry[] = [];
  try {
    const data = fs.readFileSync(GLOSSARY_PATH, "utf-8");
    glossary = JSON.parse(data);
  } catch (e) {
    console.warn("Warning: Glossary not found or invalid", e);
  }

  // Load TM
  const tm = new Map<string, TMEntry>();
  try {
    const data = fs.readFileSync(TM_PATH, "utf-8");
    const lines = data.split("\n").filter(Boolean);
    for (const line of lines) {
      const entry = JSON.parse(line) as TMEntry;
      tm.set(entry.hash, entry);
    }
  } catch {
    // TM might not exist yet
  }

  // Load Source
  const en = JSON.parse(fs.readFileSync(EN_PATH, "utf-8"));

  let changed = false;
  const newZh: Record<string, string> = {};

  for (const [key, text] of Object.entries(en)) {
    if (typeof text !== "string") {
      continue;
    }

    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Check TM
    if (tm.has(hash)) {
      const entry = tm.get(hash)!;
      newZh[key] = entry.target;
      continue;
    }

    // Check if existing translation is valid (optional, but let's trust TM more)
    // If TM miss, we translate.

    console.log(`Translating: ${key}`);
    const translated = await translate(text, glossary);
    newZh[key] = translated;
    changed = true;

    // Update TM
    tm.set(hash, {
      hash,
      source: text,
      target: translated,
      updatedAt: new Date().toISOString(),
    });

    // Save TM immediately (append)
    fs.appendFileSync(TM_PATH, JSON.stringify(tm.get(hash)) + "\n");
  }

  if (changed || Object.keys(newZh).length > 0) {
    fs.writeFileSync(ZH_PATH, JSON.stringify(newZh, null, 2));
    console.log(`Saved ${ZH_PATH}`);
  } else {
    console.log("No changes needed.");
  }
}

async function translate(text: string, glossary: GlossaryEntry[]): Promise<string> {
  const glossaryPrompt = glossary.map((g) => `- ${g.source} -> ${g.target}`).join("\n");

  const systemPrompt = `You are a professional translator. Translate the following UI string from English to Simplified Chinese.

Rules:
- Output ONLY the translated text.
- The input is a UI string, often containing HTML tags (like <span class="mono">, <a>).
- Preserve HTML tags and attributes exactly.
- Translate only the text content inside tags.
- Use fluent, idiomatic technical Chinese.
- Insert a space between Latin characters and CJK text (e.g., "Gateway 网关").
- Keep product names in English: OpenClaw, Pi, etc.
- Gateway -> 网关.

Preferred Translations:
${glossaryPrompt}

If the input is empty, output empty.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    return content || text;
  } catch (e) {
    console.error("Translation failed:", e);
    return text; // Fallback to source
  }
}

main().catch(console.error);
