/**
 * Project collaboration artifact types and helpers.
 */

/**
 * @typedef {Object} ArtifactMetric
 * @property {string} [label]
 * @property {string} [value]
 * @property {string} [status]
 */

/**
 * @typedef {Object} ArtifactSection
 * @property {string} [title]
 * @property {string[]} [items]
 */

/**
 * @typedef {Object} ArtifactLink
 * @property {string} [label]
 * @property {string} [url]
 */

/**
 * @typedef {Object} ProjectCollabArtifact
 * @property {'project-collab'} kind
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [summary]
 * @property {ArtifactMetric[]} [metrics]
 * @property {ArtifactSection[]} [sections]
 * @property {ArtifactLink[]} [links]
 */

/**
 * Parse project collaboration artifact from text.
 * Handles both raw JSON and markdown-wrapped JSON.
 * @param {string} text
 * @returns {ProjectCollabArtifact | null}
 */
export function parseProjectCollabArtifact(text) {
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  let jsonStr = text.trim();

  // Try to find JSON block if wrapped in markdown
  const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    // Try to find the first '{' and last '}'
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    // Check if it's directly the artifact or wrapped in a tool output structure
    let artifact = parsed.artifact || parsed;

    // Handle nested artifact inside content (MCP style)
    if (!artifact.kind && parsed.content && Array.isArray(parsed.content)) {
      for (const item of parsed.content) {
        if (item.type === "text" && item.text) {
          const nested = parseProjectCollabArtifact(item.text);
          if (nested) {
            return nested;
          }
        }
      }
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

/**
 * Helper to extract string from unknown value.
 */
function readString(value) {
  return typeof value === "string" ? value : undefined;
}

/**
 * Helper to extract metrics array.
 */
function readMetrics(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      label: readString(m.label),
      value: readString(m.value),
      status: readString(m.status),
    }));
}

/**
 * Helper to extract sections array.
 */
function readSections(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter((s) => s && typeof s === "object")
    .map((s) => ({
      title: readString(s.title),
      items: Array.isArray(s.items) ? s.items.filter((i) => typeof i === "string") : [],
    }));
}

/**
 * Helper to extract links array.
 */
function readLinks(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter((l) => l && typeof l === "object")
    .map((l) => ({
      label: readString(l.label),
      url: readString(l.url),
    }));
}
