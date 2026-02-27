import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { z } from 'zod';
import { tool } from 'ai';
import { executeMCPTool } from '../../mcp/client';

// Types for SKILL.md parsed content
interface SkillToolParam {
  [key: string]: string | any;
}

interface SkillTool {
  name: string;
  description: string;
  parameters: SkillToolParam;
}

interface SkillMetadata {
  mcp?: {
    server: string;
  };
}

interface SkillDefinition {
  name: string;
  description: string;
  metadata?: SkillMetadata;
  tools?: SkillTool[];
}

/**
 * Parses a simplified type string from YAML to Zod schema
 */
function parseType(typeStr: string): z.ZodTypeAny {
  const isOptional = typeStr.endsWith('?');
  const baseType = isOptional ? typeStr.slice(0, -1) : typeStr;
  
  let zodType: z.ZodTypeAny;

  if (baseType.endsWith('[]')) {
    const itemType = baseType.slice(0, -2);
    // Simple array support
    if (itemType === 'string') zodType = z.array(z.string());
    else if (itemType === 'number') zodType = z.array(z.number());
    else if (itemType === 'boolean') zodType = z.array(z.boolean());
    else zodType = z.array(z.any());
  } else {
    switch (baseType) {
      case 'string': zodType = z.string(); break;
      case 'number': zodType = z.number(); break;
      case 'boolean': zodType = z.boolean(); break;
      case 'any': zodType = z.any(); break;
      default: zodType = z.any();
    }
  }

  return isOptional ? zodType.optional() : zodType;
}

/**
 * Builds a Zod object schema from parameter definitions
 */
function buildZodSchema(params: SkillToolParam): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  if (!params) return z.object({});
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      shape[key] = parseType(value);
    } else {
      // For complex nested objects, we default to any for now to avoid complexity
      shape[key] = z.any();
    }
  }
  return z.object(shape);
}

/**
 * Loads dynamic skills from the skills directory
 */
export async function loadDynamicSkills() {
  // Find skills directory relative to current working directory
  // In development (apps/aiChat), it's ../../skills
  // In production, it might be different, but we assume monorepo structure
  const candidates = [
    path.join(process.cwd(), '../../skills'),
    path.join(process.cwd(), 'skills'),
    path.resolve(__dirname, '../../../../../../skills')
  ];

  let skillsDir = '';
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      skillsDir = dir;
      break;
    }
  }

  if (!skillsDir) {
    console.warn('[SkillLoader] Skills directory not found, skipping dynamic skills.');
    return {};
  }

  const skillDirs = fs.readdirSync(skillsDir);
  const tools: Record<string, any> = {};

  for (const dir of skillDirs) {
    // Skip hidden directories
    if (dir.startsWith('.')) continue;

    const skillPath = path.join(skillsDir, dir, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      try {
        const content = fs.readFileSync(skillPath, 'utf-8');
        const match = content.match(/^---\n([\s\S]+?)\n---/);
        
        if (match) {
          const frontmatter = match[1];
          const def = YAML.parse(frontmatter) as SkillDefinition;
          
          if (def.tools && def.metadata?.mcp) {
             const serverName = def.metadata.mcp.server;
             
             for (const t of def.tools) {
                // Check if tool is already defined (e.g. static tools take precedence? or dynamic?)
                // Here we let dynamic tools overwrite or coexist.
                // Note: unique names are required by AI SDK.
                
                tools[t.name] = tool({
                  description: t.description,
                  parameters: buildZodSchema(t.parameters),
                  execute: async (args) => {
                    console.log(`[DynamicSkill] Executing ${t.name} on ${serverName}`);
                    return executeMCPTool(serverName, t.name, args);
                  }
                });
             }
          }
        }
      } catch (e) {
        console.error(`[SkillLoader] Failed to load skill from ${skillPath}`, e);
      }
    }
  }

  return tools;
}
