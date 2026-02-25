export interface ArtifactMetric {
  label?: string;
  value?: string;
  status?: string;
}

export interface ArtifactSection {
  title?: string;
  items?: string[];
}

export interface ArtifactLink {
  label?: string;
  url?: string;
}

export interface ProjectCollabArtifact {
  kind: "project-collab";
  title?: string;
  subtitle?: string;
  summary?: string;
  metrics?: ArtifactMetric[];
  sections?: ArtifactSection[];
  links?: ArtifactLink[];
}

/**
 * Parse project collaboration artifact from text.
 * Handles both raw JSON and markdown-wrapped JSON.
 */
export function parseProjectCollabArtifact(text: string): ProjectCollabArtifact | null;
