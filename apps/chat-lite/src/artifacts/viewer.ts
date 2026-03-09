import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./project-requirement/element";
import "./project-requirement/list-element";
import "./testcase/element";
import "./iteration/overview-element";
import "./iteration/list-element";
import "./iteration/workitems-element";
import "./iteration/create-element";
import "./iteration/plan-element";
import "./milestone/list-element";
import "./milestone/detail-element";
import "./milestone/create-element";
import "./project/list-element";
import "./project/detail-element";
import "./project/create-element";
import "./requirement/list-element";
import "./requirement/detail-element";
import "./requirement/create-element";
import "./task/list-element";
import "./task/detail-element";
import "./task/create-element";
import "./defect/list-element";
import "./defect/detail-element";
import "./defect/create-element";
import "./metric/list-element";
import "./workhour/list-element";
import "./document/list-element";
import "./document/detail-element";
import type { ProjectRequirementArtifactContent } from "./project-requirement/element";
import type { TestCaseContent } from "./testcase/element";
import type { RequirementListItem } from "./project-requirement/list-element";
import type { IterationOverview } from "./iteration/overview-element";
import type { IterationListItem } from "./iteration/list-element";
import type { WorkItem } from "./iteration/workitems-element";
import type { IterationCreateData } from "./iteration/create-element";
import type { IterationPlanData } from "./iteration/plan-element";
import type { Milestone, MilestoneListContent } from "./milestone/list-element";
import type { MilestoneDetailContent } from "./milestone/detail-element";
import type { MilestoneCreateData } from "./milestone/create-element";
import type { Project, ProjectListContent } from "./project/list-element";
import type { ProjectDetailContent } from "./project/detail-element";
import type { ProjectCreateData } from "./project/create-element";
import type { Requirement, RequirementListContent } from "./requirement/list-element";
import type { RequirementDetailContent } from "./requirement/detail-element";
import type { RequirementCreateData } from "./requirement/create-element";
import type { Task, TaskListContent } from "./task/list-element";
import type { TaskDetailContent } from "./task/detail-element";
import type { TaskCreateData } from "./task/create-element";
import type { Defect, DefectListContent } from "./defect/list-element";
import type { DefectDetailContent } from "./defect/detail-element";
import type { DefectCreateData } from "./defect/create-element";
import type { Document, DocumentListContent } from "./document/list-element";
import type { DocumentDetailContent } from "./document/detail-element";

export type ArtifactKind =
  | "project-requirement"
  | "project-requirement-list"
  | "testcase"
  | "iteration-overview"
  | "iteration-list"
  | "iteration-workitems"
  | "iteration-create"
  | "iteration-plan"
  | "milestone-list"
  | "milestone-detail"
  | "milestone-create"
  | "project-list"
  | "project-detail"
  | "project-create"
  | "requirement-list"
  | "requirement-detail"
  | "requirement-create"
  | "task-list"
  | "task-detail"
  | "task-create"
  | "defect-list"
  | "defect-detail"
  | "defect-create"
  | "metric-list"
  | "workhour-list"
  | "document-list"
  | "document-detail"
  | "service-detail"
  | "transaction-detail"
  | "release-detail"
  | "workflow-detail"
  | "work-statistics"
  | "report-detail"
  | string;

export interface ArtifactContent {
  kind: ArtifactKind;
  data: unknown;
}

/**
 * 技能到 Artifact 的映射表
 */
const SKILL_TO_ARTIFACT_MAP: Record<string, ArtifactKind> = {
  // 任务管理
  'task_query': 'task-detail',
  'task_list': 'task-list',
  'task_update': 'task-create',
  
  // 需求管理
  'requirement_query': 'requirement-detail',
  'requirement_list': 'requirement-list',
  'requirement_create': 'requirement-create',
  
  // 里程碑管理
  'milestone_query': 'milestone-detail',
  'milestone_list': 'milestone-list',
  'milestone_create': 'milestone-create',
  
  // 缺陷管理
  'defect_query': 'defect-detail',
  'defect_list': 'defect-list',
  'defect_create': 'defect-create',
  'defect_update': 'defect-create',
  
  // 风险管理
  'risk_query': 'defect-detail',  // 复用缺陷详情组件
  'risk_list': 'defect-list',     // 复用缺陷列表组件
  
  // 测试管理
  'test_plan_query': 'testcase',
  'test_plan_list': 'testcase',
  'test_case_query': 'testcase',
  'test_case_list': 'testcase',
  
  // 迭代管理
  'iteration_query': 'iteration-overview',
  'iteration_list': 'iteration-list',
  'iteration_planning': 'iteration-plan',
  'iteration_create': 'iteration-create',
  
  // 文档管理
  'document_query': 'document-detail',
  'document_list': 'document-list',
  
  // 项目管理
  'project_query': 'project-detail',
  'project_list': 'project-list',
  'project_create': 'project-create',
  
  // 自由职业者服务
  'service_query': 'service-detail',
  'transaction_query': 'transaction-detail',
  
  // 发布管理
  'release_create': 'release-detail',
  
  // 协作管理
  'workflow_create': 'workflow-detail',
  
  // 工时管理
  'work_statistics': 'workhour-list',
  
  // 报告管理
  'report_query': 'report-detail',
};

/**
 * Artifact 组件标签名映射
 */
const ARTIFACT_TO_COMPONENT_MAP: Record<string, string> = {
  'task-detail': 'task-detail-element',
  'task-list': 'task-list-element',
  'task-create': 'task-create-element',
  
  'requirement-detail': 'requirement-detail-element',
  'requirement-list': 'requirement-list-element',
  'requirement-create': 'requirement-create-element',
  
  'milestone-detail': 'milestone-detail-element',
  'milestone-list': 'milestone-list-element',
  'milestone-create': 'milestone-create-element',
  
  'defect-detail': 'defect-detail-element',
  'defect-list': 'defect-list-element',
  'defect-create': 'defect-create-element',
  
  'testcase': 'testcase-element',
  
  'iteration-overview': 'iteration-overview-element',
  'iteration-list': 'iteration-list-element',
  'iteration-plan': 'iteration-plan-element',
  'iteration-create': 'iteration-create-element',
  
  'document-detail': 'document-detail-element',
  'document-list': 'document-list-element',
  
  'project-detail': 'project-detail-element',
  'project-list': 'project-list-element',
  'project-create': 'project-create-element',
  
  'workhour-list': 'workhour-list-element',
};

@customElement("chatlite-artifact-viewer")
export class ArtifactViewer extends LitElement {
  @property() visible = false;
  @property() skillName?: string;
  @property() artifactKind?: ArtifactKind;
  @property() data?: unknown;
  @property() title?: string;
  @state() private activeTab = 'detail';

  // 根据技能名称获取 Artifact 类型
  getArtifactKindFromSkill(skillName: string): ArtifactKind | undefined {
    return SKILL_TO_ARTIFACT_MAP[skillName];
  }

  // 根据 Artifact 类型获取组件标签名
  getComponentTag(kind: ArtifactKind): string {
    return ARTIFACT_TO_COMPONENT_MAP[kind] || 'div';
  }

  // 检查是否有对应的 Artifact 组件
  hasArtifactComponent(kind: ArtifactKind): boolean {
    return !!ARTIFACT_TO_COMPONENT_MAP[kind];
  }

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="artifact-viewer">
        <div class="artifact-header">
          <div class="artifact-title-section">
            <h2 class="artifact-title">${this.title || this.getArtifactTitle()}</h2>
            ${this.skillName && html`
              <span class="skill-badge">@${this.skillName}</span>
            `}
          </div>
          <div class="artifact-actions">
            <button class="icon-btn" @click=${this.refresh} title="刷新">
              🔄
            </button>
            <button class="close-btn" @click=${this.close}>×</button>
          </div>
        </div>

        ${this.renderTabs()}

        <div class="artifact-content">
          ${this.renderArtifact()}
        </div>
      </div>
    `;
  }

  renderTabs() {
    const tabs = ['detail', 'list', 'create'];
    
    return html`
      <div class="artifact-tabs">
        ${tabs.map(tab => html`
          <button
            class="tab ${this.activeTab === tab ? 'active' : ''}"
            @click=${() => this.activeTab = tab}
          >
            ${this.getTabLabel(tab)}
          </button>
        `)}
      </div>
    `;
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      'detail': '详情',
      'list': '列表',
      'create': '创建'
    };
    return labels[tab] || tab;
  }

  renderArtifact() {
    // 1. 如果指定了 skillName，先转换为 artifactKind
    if (this.skillName && !this.artifactKind) {
      this.artifactKind = this.getArtifactKindFromSkill(this.skillName);
    }

    // 2. 根据 artifactKind 渲染对应组件
    if (this.artifactKind) {
      const componentTag = this.getComponentTag(this.artifactKind);
      
      if (componentTag === 'div') {
        return this.renderFallback();
      }

      return html`
        <${componentTag} .data=${this.data}></${componentTag}>
      `;
    }

    // 3. 如果没有 artifactKind，尝试根据数据渲染
    return this.renderFallback();
  }

  renderFallback() {
    return html`
      <div class="artifact-fallback">
        <div class="fallback-icon">📋</div>
        <h3>Artifact 预览</h3>
        ${this.skillName && html`
          <p class="skill-name">技能：@${this.skillName}</p>
        `}
        ${this.data && html`
          <pre class="data-preview">${JSON.stringify(this.data, null, 2)}</pre>
        `}
      </div>
    `;
  }

  getArtifactTitle(): string {
    if (this.artifactKind) {
      const titles: Record<string, string> = {
        'task-detail': '任务详情',
        'task-list': '任务列表',
        'requirement-detail': '需求详情',
        'requirement-list': '需求列表',
        'milestone-detail': '里程碑详情',
        'milestone-list': '里程碑列表',
        'defect-detail': '缺陷详情',
        'defect-list': '缺陷列表',
        'iteration-overview': '迭代概览',
        'iteration-list': '迭代列表',
        'document-detail': '文档详情',
        'document-list': '文档列表',
        'project-detail': '项目详情',
        'project-list': '项目列表',
      };
      return titles[this.artifactKind] || 'Artifact';
    }
    return 'Artifact';
  }

  refresh() {
    this.dispatchEvent(new CustomEvent('artifact-refresh', {
      bubbles: true,
      composed: true
    }));
  }

  close() {
    this.dispatchEvent(new CustomEvent('artifact-close', {
      bubbles: true,
      composed: true
    }));
  }

  // 公开方法：显示 Artifact
  showArtifact(skillName: string, data: unknown, title?: string) {
    this.skillName = skillName;
    this.artifactKind = this.getArtifactKindFromSkill(skillName);
    this.data = data;
    this.title = title;
    this.visible = true;
    this.activeTab = 'detail';
  }

  // 公开方法：隐藏 Artifact
  hideArtifact() {
    this.visible = false;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .artifact-viewer {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .artifact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .artifact-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .artifact-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .skill-badge {
      font-size: 13px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-family: 'Courier New', monospace;
    }

    .artifact-actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn,
    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .icon-btn:hover,
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .artifact-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .tab {
      padding: 10px 20px;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: #374151;
      background: #f3f4f6;
    }

    .tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
      background: white;
    }

    .artifact-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f3f4f6;
    }

    .artifact-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #6b7280;
    }

    .fallback-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .fallback h3 {
      font-size: 20px;
      color: #374151;
      margin-bottom: 12px;
    }

    .skill-name {
      font-size: 14px;
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      padding: 6px 12px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .data-preview {
      background: white;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 100%;
      overflow-x: auto;
      border: 1px solid #e5e7eb;
    }
  `;
}
