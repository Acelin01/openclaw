/**
 * Helper functions for tool card rendering.
 */

import { PREVIEW_MAX_CHARS, PREVIEW_MAX_LINES } from "./constants.ts";

type ArtifactMetric = {
  label?: string;
  value?: string;
  status?: string;
};

type ArtifactSection = {
  title?: string;
  items?: string[];
};

type ArtifactLink = {
  label?: string;
  url?: string;
};

export type ProjectCollabArtifact = {
  kind: "project-collab";
  title?: string;
  subtitle?: string;
  summary?: string;
  metrics?: ArtifactMetric[];
  sections?: ArtifactSection[];
  links?: ArtifactLink[];
};

/**
 * Format tool output content for display in the sidebar.
 * Detects JSON and wraps it in a code block with formatting.
 */
export function formatToolOutputForSidebar(text: string): string {
  const trimmed = text.trim();
  const artifact = parseProjectCollabArtifact(trimmed);
  if (artifact) {
    return formatProjectCollabArtifactForSidebar(artifact);
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return "```json\n" + JSON.stringify(parsed, null, 2) + "\n```";
    } catch {}
  }
  return text;
}

/**
 * Get a truncated preview of tool output text.
 * Truncates to first N lines or first N characters, whichever is shorter.
 */
export function getTruncatedPreview(text: string): string {
  const allLines = text.split("\n");
  const lines = allLines.slice(0, PREVIEW_MAX_LINES);
  const preview = lines.join("\n");
  if (preview.length > PREVIEW_MAX_CHARS) {
    return preview.slice(0, PREVIEW_MAX_CHARS) + "…";
  }
  return lines.length < allLines.length ? preview + "…" : preview;
}

export function parseProjectCollabArtifact(text: string): ProjectCollabArtifact | null {
  if (!text.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(text);
    if (!isRecord(parsed)) {
      return null;
    }
    const artifact = parsed.artifact;
    if (!isRecord(artifact)) {
      return null;
    }
    if (artifact.kind !== "project-collab") {
      return null;
    }
    return {
      kind: "project-collab",
      title: readString(artifact.title),
      subtitle: readString(artifact.subtitle),
      summary: readString(artifact.summary),
      metrics: readMetrics(artifact.metrics),
      sections: readSections(artifact.sections),
      links: readLinks(artifact.links),
    };
  } catch {
    return null;
  }
}

export function formatProjectCollabArtifactForSidebar(artifact: ProjectCollabArtifact): string {
  const title = artifact.title?.trim() || "项目协同";
  const lines = [`## ${title}`];
  if (artifact.subtitle) {
    lines.push(`**${artifact.subtitle}**`);
  }
  if (artifact.summary) {
    lines.push("", artifact.summary);
  }
  if (artifact.metrics && artifact.metrics.length > 0) {
    lines.push("", "### 指标");
    for (const metric of artifact.metrics) {
      if (!metric.label || !metric.value) {
        continue;
      }
      lines.push(`- ${metric.label}: ${metric.value}`);
    }
  }
  if (artifact.sections && artifact.sections.length > 0) {
    for (const section of artifact.sections) {
      if (!section?.title || !section.items || section.items.length === 0) {
        continue;
      }
      lines.push("", `### ${section.title}`);
      for (const item of section.items) {
        lines.push(`- ${item}`);
      }
    }
  }
  if (artifact.links && artifact.links.length > 0) {
    lines.push("", "### 相关链接");
    for (const link of artifact.links) {
      if (!link?.url) {
        continue;
      }
      lines.push(`- ${link.label ?? link.url}: ${link.url}`);
    }
  }
  return lines.join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readMetrics(value: unknown): ArtifactMetric[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter(isRecord)
    .map((metric) => ({
      label: readString(metric.label),
      value: readString(metric.value),
      status: readString(metric.status),
    }))
    .filter((metric) => metric.label || metric.value);
}

function readSections(value: unknown): ArtifactSection[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter(isRecord)
    .map((section) => ({
      title: readString(section.title),
      items: Array.isArray(section.items)
        ? section.items.filter((item) => typeof item === "string")
        : [],
    }))
    .filter((section) => section.title || section.items.length > 0);
}

function readLinks(value: unknown): ArtifactLink[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter(isRecord)
    .map((link) => ({
      label: readString(link.label),
      url: readString(link.url),
    }))
    .filter((link) => link.label || link.url);
}
