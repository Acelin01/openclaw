import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { skillPatterns, type SkillPattern, type ParamDesc } from "../lib/skill-matcher";

/**
 * 技能面板组件
 * 显示可用技能列表，支持搜索和选择
 */
@customElement("chatlite-skill-panel")
export class SkillPanel extends LitElement {
  @property() selectedSkill?: SkillPattern;
  @property() visible = false;
  @state() searchQuery = "";
  @state() expandedCategory?: string;

  // 技能分类
  private categories = {
    "项目管理": ["project_create", "project_query", "project_list", "project_update", "project_metrics", "project_settings"],
    "任务管理": ["task_create", "task_query", "task_list", "task_update", "task_update_status"],
    "需求管理": ["requirement_create", "requirement_query", "requirement_list", "requirement_update"],
    "里程碑管理": ["milestone_create", "milestone_query", "milestone_list", "milestone_update", "milestone_monitor"],
    "缺陷管理": ["defect_create", "defect_query", "defect_list", "defect_update", "bug_create"],
    "风险管理": ["risk_create", "risk_query", "risk_list", "risk_update"],
    "测试管理": ["test_plan_create", "test_plan_query", "test_plan_list", "test_case_create", "test_case_query", "test_case_list", "test_execution_create"],
    "迭代管理": ["iteration_create", "iteration_query", "iteration_list", "iteration_planning"],
    "文档管理": ["document_create", "document_query", "document_list", "document_update", "document_get"],
    "工时管理": ["time_tracking_create", "time_tracking_query", "timesheet_create", "work_statistics"],
    "发布管理": ["release_create", "release_plan", "deploy_create"],
    "代码审查": ["code_review_create", "code_review_query"],
    "自由职业者": ["freelancer_update", "service_query", "transaction_query", "contract_query", "talent_match_enhanced"],
    "协作管理": ["team_update", "collaboration_query", "agent_collaboration_execute", "workflow_create", "workflow_execute"],
    "报告分析": ["report_create", "report_query", "analytics_dashboard", "performance_metrics", "export_data"]
  };

  // 过滤技能列表
  get filteredSkills() {
    if (!this.searchQuery) return skillPatterns;
    
    const query = this.searchQuery.toLowerCase();
    return skillPatterns.filter(skill => {
      return (
        skill.skill.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.params?.some(p => p.description.toLowerCase().includes(query))
      );
    });
  }

  // 按分类分组技能
  get groupedSkills() {
    const groups: Record<string, SkillPattern[]> = {};
    
    for (const [category, skillNames] of Object.entries(this.categories)) {
      const skills = this.filteredSkills.filter(s => skillNames.includes(s.skill));
      if (skills.length > 0) {
        groups[category] = skills;
      }
    }
    
    return groups;
  }

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="skill-panel">
        <div class="panel-header">
          <h3>技能服务</h3>
          <button class="close-btn" @click=${this.close}>×</button>
        </div>
        
        <div class="search-box">
          <input
            type="text"
            placeholder="搜索技能..."
            .value=${this.searchQuery}
            @input=${this.handleSearch}
          />
          ${this.searchQuery && html`
            <button class="clear-btn" @click=${this.clearSearch}>×</button>
          `}
        </div>

        <div class="skill-list">
          ${Object.entries(this.groupedSkills).map(([category, skills]) => html`
            <div class="skill-category">
              <div 
                class="category-header" 
                @click=${() => this.toggleCategory(category)}
              >
                <span class="category-name">${category}</span>
                <span class="category-count">${skills.length}</span>
                <span class="category-arrow">${this.expandedCategory === category ? '▼' : '▶'}</span>
              </div>
              
              ${this.expandedCategory === category || !this.expandedCategory ? html`
                <div class="category-skills">
                  ${skills.map(skill => html`
                    <div
                      class="skill-card ${this.selectedSkill?.skill === skill.skill ? 'selected' : ''}"
                      @click=${() => this.selectSkill(skill)}
                    >
                      <div class="skill-header">
                        <div class="skill-name">${skill.skill}</div>
                        ${skill.artifact && html`
                          <span class="artifact-badge" title="有 Artifact 组件">📋</span>
                        `}
                      </div>
                      
                      ${skill.description && html`
                        <div class="skill-desc">${skill.description}</div>
                      `}
                      
                      ${skill.params && skill.params.length > 0 && html`
                        <div class="skill-params">
                          ${skill.params.filter(p => p.required).slice(0, 3).map(p => html`
                            <span class="param-tag" title="${p.description}">
                              ${p.name}${p.required ? '*' : ''}
                            </span>
                          `)}
                          ${skill.params.filter(p => p.required).length > 3 && html`
                            <span class="param-tag more">+${skill.params.filter(p => p.required).length - 3}</span>
                          `}
                        </div>
                      `}
                    </div>
                  `)}
                </div>
              ` : ''}
            </div>
          `)}
        </div>

        <div class="panel-footer">
          <div class="skill-count">共 ${this.filteredSkills.length} 个技能</div>
        </div>
      </div>
    `;
  }

  handleSearch(e: InputEvent) {
    this.searchQuery = (e.target as HTMLInputElement).value;
    // 搜索时展开所有分类
    if (this.searchQuery) {
      this.expandedCategory = undefined;
    }
  }

  clearSearch() {
    this.searchQuery = "";
    this.expandedCategory = undefined;
  }

  toggleCategory(category: string) {
    this.expandedCategory = this.expandedCategory === category ? undefined : category;
  }

  selectSkill(skill: SkillPattern) {
    this.selectedSkill = skill;
    this.dispatchEvent(new CustomEvent('skill-select', {
      detail: { skill },
      bubbles: true,
      composed: true
    }));
  }

  close() {
    this.dispatchEvent(new CustomEvent('skill-panel-close', {
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    :host {
      display: block;
    }

    .skill-panel {
      width: 320px;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .search-box {
      position: relative;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .search-box input {
      width: 100%;
      padding: 8px 32px 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .search-box input:focus {
      border-color: #10b981;
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 28px;
      top: 50%;
      transform: translateY(-50%);
      background: #e5e7eb;
      border: none;
      color: #6b7280;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #d1d5db;
      color: #374151;
    }

    .skill-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .skill-category {
      margin-bottom: 8px;
      border-radius: 6px;
      overflow: hidden;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #f3f4f6;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .category-header:hover {
      background: #e5e7eb;
    }

    .category-name {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .category-count {
      font-size: 12px;
      color: #6b7280;
      background: white;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .category-arrow {
      font-size: 12px;
      color: #9ca3af;
      transition: transform 0.2s;
    }

    .category-skills {
      padding: 4px;
      background: white;
    }

    .skill-card {
      padding: 12px;
      margin: 4px 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .skill-card:hover {
      border-color: #10b981;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
      transform: translateX(2px);
    }

    .skill-card.selected {
      border-color: #10b981;
      background: #f0fdf4;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .skill-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      font-family: 'Courier New', monospace;
    }

    .artifact-badge {
      font-size: 16px;
      cursor: help;
    }

    .skill-desc {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .skill-params {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .param-tag {
      font-size: 11px;
      padding: 2px 6px;
      background: #f3f4f6;
      border-radius: 4px;
      color: #374151;
      cursor: help;
    }

    .param-tag.more {
      background: #e5e7eb;
      color: #6b7280;
    }

    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skill-count {
      font-size: 12px;
      color: #6b7280;
    }
  `;
}
