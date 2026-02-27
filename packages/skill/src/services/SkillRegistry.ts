import { Skill } from "../models/Skill";
import { SkillDefinition } from "../types/skill";

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, Skill> = new Map();

  private constructor() {}

  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  public register(skill: Skill): void {
    this.skills.set(skill.definition.id, skill);
  }

  public getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  public findSkillsByCategory(category: string): Skill[] {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.definition.category === category,
    );
  }

  public listAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values()).map((skill) => skill.definition);
  }

  public unregister(id: string): boolean {
    return this.skills.delete(id);
  }
}
