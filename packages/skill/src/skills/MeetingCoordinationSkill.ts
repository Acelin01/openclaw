import { Skill } from "../models/Skill";
import { SkillLevel } from "../types/skill";

export class MeetingCoordinationSkill extends Skill {
  constructor() {
    super({
      id: "meeting-coordination-skill",
      name: "会议管理技能",
      description: "组织会议、编写议程、记录纪要及跟进待办事项",
      level: SkillLevel.PROFICIENT,
      category: "会议",
      version: "1.0.0",
      inputs: [{ name: "topic", type: "string", required: true, description: "会议主题" }],
      outputs: [
        { name: "agenda", type: "object", description: "议程" },
        { name: "minutes", type: "object", description: "纪要" },
        { name: "action_items", type: "list", description: "待办事项" },
      ],
    });
  }

  public async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    const { meeting_type, participants, topic } = inputs;

    console.log(`[MeetingCoordinationSkill] 正在组织会议: ${topic}`);

    // 模拟会议管理逻辑
    const agenda = {
      title: `${meeting_type}: ${topic}`,
      time_slots: [
        { time: "10:00 - 10:10", activity: "Introduction and Goals" },
        { time: "10:10 - 10:40", activity: "Main Discussion" },
        { time: "10:40 - 10:55", activity: "Action Items and Q&A" },
        { time: "10:55 - 11:00", activity: "Wrap-up" },
      ],
    };

    const minutes = {
      summary: `Discussed the core components of ${topic}. All participants agreed on the general direction.`,
      key_decisions: [
        "Adopt the microservices architecture",
        "Use TypeScript for all new development",
      ],
      absent: [],
    };

    const action_items = [
      { owner: participants[0], task: "Create draft architecture diagram", deadline: "2026-02-10" },
      {
        owner: participants[1] || "Assigned Agent",
        task: "Research security protocols",
        deadline: "2026-02-12",
      },
    ];

    return {
      agenda,
      minutes,
      action_items,
    };
  }
}
