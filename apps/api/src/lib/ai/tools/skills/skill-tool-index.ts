import fs from "node:fs";
import path from "node:path";

type SkillToolIndex = {
  skillsDir: string;
  skillNames: string[];
  toolNames: string[];
};

type CacheEntry = {
  updatedAt: number;
  signature: string;
  index: SkillToolIndex;
};

const cache: { entry?: CacheEntry } = {};

const DEFAULT_SKILLS_DIR = path.resolve(process.cwd(), "skills");
const CACHE_TTL_MS = 30_000;

function readSkillFrontmatter(content: string) {
  const match = content.match(/^\s*---\s*([\s\S]*?)\n---/);
  if (!match) {
    return { name: undefined, description: undefined };
  }
  const block = match[1] ?? "";
  const name = block.match(/^\s*name:\s*(.+)\s*$/m)?.[1]?.trim();
  const description = block.match(/^\s*description:\s*(.+)\s*$/m)?.[1]?.trim();
  return { name, description };
}

function extractToolNamesFromJson(content: string) {
  const names: string[] = [];
  const blocks = content.matchAll(/```json\s*([\s\S]*?)```/gi);
  for (const block of blocks) {
    const raw = block[1];
    if (!raw) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      const tools = Array.isArray(parsed?.tools) ? parsed.tools : [];
      for (const tool of tools) {
        if (tool && typeof tool.name === "string") {
          names.push(tool.name);
        }
      }
    } catch {
      continue;
    }
  }
  return names;
}

function extractToolNamesFromInlineCode(content: string) {
  const names: string[] = [];
  const matches = content.matchAll(/`([a-z][a-z0-9_]+)`/gi);
  for (const match of matches) {
    const token = match[1];
    if (token) {
      names.push(token);
    }
  }
  return names;
}

function listSkillFiles(skillsDir: string) {
  if (!fs.existsSync(skillsDir)) {
    return [];
  }
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const filePath = path.join(skillsDir, entry.name, "SKILL.md");
    if (fs.existsSync(filePath)) {
      files.push(filePath);
    }
  }
  return files;
}

function buildSignature(files: string[]) {
  return files
    .map((filePath) => {
      try {
        const stat = fs.statSync(filePath);
        return `${filePath}:${stat.mtimeMs}:${stat.size}`;
      } catch {
        return `${filePath}:missing`;
      }
    })
    .join("|");
}

export function loadSkillToolIndex(skillsDir: string = DEFAULT_SKILLS_DIR): SkillToolIndex {
  const now = Date.now();
  const files = listSkillFiles(skillsDir);
  const signature = buildSignature(files);
  const cached = cache.entry;
  if (cached && cached.signature === signature && now - cached.updatedAt < CACHE_TTL_MS) {
    return cached.index;
  }
  const skillNames: string[] = [];
  const toolNames = new Set<string>();
  for (const filePath of files) {
    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }
    const { name } = readSkillFrontmatter(content);
    if (name) {
      skillNames.push(name);
    }
    const jsonTools = extractToolNamesFromJson(content);
    const inlineTools = extractToolNamesFromInlineCode(content);
    for (const toolName of [...jsonTools, ...inlineTools]) {
      toolNames.add(toolName);
    }
  }
  const index: SkillToolIndex = {
    skillsDir,
    skillNames,
    toolNames: Array.from(toolNames),
  };
  cache.entry = { updatedAt: now, signature, index };
  return index;
}
