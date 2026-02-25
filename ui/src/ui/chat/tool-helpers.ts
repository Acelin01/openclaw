/**
 * Helper functions for tool card rendering.
 */

import { html, nothing } from "lit";
import {
  parseProjectCollabArtifact,
  type ProjectCollabArtifact,
  type ArtifactMetric,
  type ArtifactSection,
  type ArtifactLink,
} from "openclaw-project-collab-client";
import { PREVIEW_MAX_CHARS, PREVIEW_MAX_LINES } from "./constants.ts";

export type { ProjectCollabArtifact, ArtifactMetric, ArtifactSection, ArtifactLink };
export { parseProjectCollabArtifact, renderProjectArtifact };

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
      if (!section.title || !section.items || section.items.length === 0) {
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
      if (!link.url) {
        continue;
      }
      lines.push(`- ${link.label ?? link.url}: ${link.url}`);
    }
  }
  return lines.join("\n");
}

function renderProjectArtifact(artifact: ProjectCollabArtifact) {
  const metrics = artifact.metrics ?? [];
  const sections = artifact.sections ?? [];
  const links = artifact.links ?? [];

  return html`
    <div class="chat-tool-card__artifact">
      ${artifact.summary ? html`<div class="chat-tool-card__artifact-summary">${artifact.summary}</div>` : nothing}
      ${
        metrics.length > 0
          ? html`
              <div class="chat-tool-card__artifact-metrics">
                ${metrics.map((metric) => {
                  const statusClass = metric.status ? `artifact-metric--${metric.status}` : "";
                  return html`
                    <div class="chat-tool-card__artifact-metric ${statusClass}">
                      <div class="chat-tool-card__artifact-metric-label">${metric.label ?? ""}</div>
                      <div class="chat-tool-card__artifact-metric-value">${metric.value ?? ""}</div>
                    </div>
                  `;
                })}
              </div>
            `
          : nothing
      }
      ${
        sections.length > 0
          ? html`
              <div class="chat-tool-card__artifact-sections">
                ${sections.map((section) => {
                  return html`
                    <div class="chat-tool-card__artifact-section">
                      <div class="chat-tool-card__artifact-section-title">${section.title ?? ""}</div>
                      <ul class="chat-tool-card__artifact-section-list">
                        ${(section.items ?? []).map((item) => html`<li>${item}</li>`)}
                      </ul>
                    </div>
                  `;
                })}
              </div>
            `
          : nothing
      }
      ${
        links.length > 0
          ? html`
              <div class="chat-tool-card__artifact-links">
                ${links.map((link) => {
                  if (!link.url) {
                    return nothing;
                  }
                  return html`<a href=${link.url} target="_blank" rel="noreferrer">${link.label ?? link.url}</a>`;
                })}
              </div>
            `
          : nothing
      }
    </div>
  `;
}
