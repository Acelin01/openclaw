import path from "node:path";
import { loadWorkspaceSkillEntries } from "../src/agents/skills/workspace.js";

async function main() {
  const workspaceDir = process.cwd();
  console.log(`Loading skills from workspace: ${workspaceDir}`);
  const skillsDir = path.join(workspaceDir, "skills");
  console.log(`Expected skills dir: ${skillsDir}`);

  try {
    const entries = loadWorkspaceSkillEntries(workspaceDir);
    console.log(`Loaded ${entries.length} skills.`);
    for (const entry of entries) {
      console.log(`- ${entry.skill.name} (${entry.skill.source})`);
    }
  } catch (error) {
    console.error("Error loading skills:", error);
  }
}

main();
