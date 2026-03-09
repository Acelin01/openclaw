/**
 * 技能匹配器
 * 定义可用的技能模式
 */

export interface SkillPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  patterns: string[];
  action?: string;
}

// 技能分类
export const CATEGORIES = {
  development: '开发',
  design: '设计',
  data: '数据',
  ai: 'AI',
  writing: '写作',
  research: '研究',
  other: '其他',
};

// 技能模式列表
export const skillPatterns: SkillPattern[] = [
  {
    id: 'weather',
    name: '天气查询',
    description: '查询实时天气和天气预报',
    category: 'data',
    icon: '🌤️',
    patterns: ['天气', '气温', '下雨', '晴天', '多云', '风力', '湿度'],
  },
  {
    id: 'coding',
    name: '代码助手',
    description: '编写、调试和优化代码',
    category: 'development',
    icon: '💻',
    patterns: ['代码', '编程', '开发', '写程序', 'bug', '调试', '函数', '类'],
  },
  {
    id: 'search',
    name: '网络搜索',
    description: '搜索网络信息和资料',
    category: 'research',
    icon: '🔍',
    patterns: ['搜索', '查找', '查询', 'google', '百度', '资料', '信息'],
  },
  {
    id: 'translate',
    name: '翻译',
    description: '多语言翻译服务',
    category: 'writing',
    icon: '🌐',
    patterns: ['翻译', '英文', '中文', '语言', '日语', '韩语', '法语'],
  },
  {
    id: 'writing',
    name: '写作助手',
    description: '帮助撰写文章、邮件、文档',
    category: 'writing',
    icon: '✍️',
    patterns: ['写', '文章', '邮件', '文档', '报告', '总结', '文案'],
  },
  {
    id: 'analysis',
    name: '数据分析',
    description: '数据清洗、分析和可视化',
    category: 'data',
    icon: '📊',
    patterns: ['数据', '分析', '图表', '可视化', '统计', '报表'],
  },
  {
    id: 'design',
    name: '设计建议',
    description: 'UI/UX 设计建议和评审',
    category: 'design',
    icon: '🎨',
    patterns: ['设计', 'UI', 'UX', '界面', '配色', '布局', '原型'],
  },
  {
    id: 'summarize',
    name: '内容总结',
    description: '总结长文本、文章、会议记录',
    category: 'ai',
    icon: '📝',
    patterns: ['总结', '摘要', '概括', '要点', '会议记录'],
  },
  {
    id: 'brainstorm',
    name: '头脑风暴',
    description: '创意生成和思路拓展',
    category: 'ai',
    icon: '💡',
    patterns: ['创意', '想法', '思路', '方案', '建议', '头脑风暴'],
  },
  {
    id: 'review',
    name: '代码审查',
    description: '代码质量审查和优化建议',
    category: 'development',
    icon: '🔎',
    patterns: ['审查', 'review', '优化', '改进', '代码质量', '最佳实践'],
  },
];

/**
 * 匹配技能
 */
export function matchSkill(text: string): SkillPattern | null {
  const lowerText = text.toLowerCase();
  
  for (const skill of skillPatterns) {
    for (const pattern of skill.patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        return skill;
      }
    }
  }
  
  return null;
}

/**
 * 按分类获取技能
 */
export function getSkillsByCategory(category: string): SkillPattern[] {
  if (category === 'all') {
    return skillPatterns;
  }
  return skillPatterns.filter(skill => skill.category === category);
}

/**
 * 搜索技能
 */
export function searchSkills(query: string): SkillPattern[] {
  const lowerQuery = query.toLowerCase();
  return skillPatterns.filter(skill => 
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.description.toLowerCase().includes(lowerQuery) ||
    skill.patterns.some(p => p.toLowerCase().includes(lowerQuery))
  );
}
