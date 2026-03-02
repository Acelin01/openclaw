import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { chatClient, type ChatMessage } from "../client/chat-client";
import { skillMatcher, type MatchedSkill } from "../services/skill-matcher";
import { requirementManager, type RequirementDraft } from "../services/requirement-manager";
import { testcaseManager } from "../services/testcase-manager";
import { generateUUID, formatTime } from "../lib/utils";
import "../artifacts/viewer";
import type { ArtifactContent } from "../artifacts/viewer";

@customElement("chatlite-app")
export class ChatLiteApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #ffffff;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .header h1 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
    }

    .status-dot.connected {
      background: #10b981;
    }

    .status-dot.connecting {
      background: #f59e0b;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .chat-panel {
      display: flex;
      flex-direction: column;
      flex: 1;
      border-right: 1px solid #e5e7eb;
    }

    .artifact-panel {
      width: 400px;
      display: flex;
      flex-direction: column;
      background: #f9fafb;
    }

    .artifact-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      gap: 12px;
      max-width: 80%;
    }

    .message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      flex-shrink: 0;
    }

    .message.user .message-avatar {
      background: #3b82f6;
      color: white;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.875rem;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .message.assistant .message-bubble {
      background: #f3f4f6;
      color: #111827;
      border-bottom-left-radius: 4px;
    }

    .message.user .message-bubble {
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-time {
      font-size: 0.75rem;
      color: #9ca3af;
      padding: 0 4px;
    }

    .message.user .message-time {
      text-align: right;
    }

    .message-artifact {
      margin-top: 8px;
      padding: 8px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #374151;
      cursor: pointer;
    }

    .message-artifact:hover {
      background: #f9fafb;
    }

    .input-area {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #ffffff;
    }

    .input-wrapper {
      flex: 1;
      position: relative;
    }

    input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      padding-right: 100px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }

    input[type="text"]:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-actions {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 4px;
    }

    button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-send {
      background: #3b82f6;
      color: white;
    }

    .btn-send:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-send:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #f9fafb;
    }

    .skills-dropdown {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 8px;
      z-index: 100;
    }

    .skill-item {
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .skill-item:hover {
      background: #f3f4f6;
    }

    .skill-name {
      font-weight: 500;
      color: #111827;
    }

    .skill-desc {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 2px;
    }

    .pending-review {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #fefce8;
    }

    .pending-review h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #92400e;
      margin: 0 0 8px 0;
    }

    .draft-item {
      padding: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .draft-title {
      font-weight: 500;
      color: #111827;
      font-size: 0.875rem;
    }

    .draft-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 0.75rem;
    }

    .empty-artifact {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
      padding: 24px;
    }
  `;

  @state()
  private messages: ChatMessage[] = [];

  @state()
  private inputValue = "";

  @state()
  private isGatewayConnected = false;

  @state()
  private isConnecting = false;

  @state()
  private matchedSkills: MatchedSkill[] = [];

  @state()
  private showSkills = false;

  @state()
  private currentArtifact: ArtifactContent | null = null;

  @state()
  private pendingDrafts: RequirementDraft[] = [];

  @state()
  private showArtifactPanel = false;

  @state()
  private isResizing = false;

  @state()
  private artifactPanelWidth = 500;

  private gatewayUrl = "ws://localhost:18789";

  connectedCallback() {
    super.connectedCallback();
    this._connect();
  }

  private async _connect() {
    this.isConnecting = true;
    try {
      await chatClient.connect(this.gatewayUrl);
      this.isGatewayConnected = true;
      this.isConnecting = false;

      // 获取可用技能
      const skills = await chatClient.getAvailableSkills();
      skillMatcher.setSkills(skills);

      // 监听消息
      chatClient.onMessage((msg) => this._handleIncomingMessage(msg));
    } catch (err) {
      console.error("Failed to connect:", err);
      this.isConnecting = false;
    }
  }

  private _handleIncomingMessage(msg: ChatMessage) {
    this.messages = [...this.messages, msg];

    // 如果消息包含 artifact，显示它
    if (msg.artifact) {
      this.currentArtifact = {
        kind: msg.artifact.kind,
        data: JSON.parse(msg.artifact.content),
      };
    }
  }

  private async _sendMessage() {
    if (!this.inputValue.trim()) {
      return;
    }

    const content = this.inputValue.trim();
    this.inputValue = "";
    this.showSkills = false;

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: generateUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    this.messages = [...this.messages, userMsg];

    // 检查是否连接
    if (!chatClient.isConnected()) {
      // 未连接时，尝试重连或显示本地响应
      console.log("[ChatLite] Not connected to gateway, using local mode");
      this._handleLocalResponse(content);
      return;
    }

    // 解析技能调用
    const parsedCall = skillMatcher.parseSkillCall(content);

    if (parsedCall) {
      // 匹配到技能，创建需求草稿
      requirementManager.createDraft(
        parsedCall.params.title as string || "新需求",
        parsedCall.params.description as string || content,
        [parsedCall.skillName],
        parsedCall.params
      );

      this.pendingDrafts = requirementManager.getPendingReviewDrafts();

      // 发送技能调用
      try {
        await chatClient.invokeSkill(parsedCall.skillName, {
          action: parsedCall.action,
          ...parsedCall.params,
        });
      } catch (err) {
        console.error("Skill invocation failed:", err);
        this._addAssistantMessage(`技能调用失败：${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // 普通消息
      await chatClient.sendMessage(content);
    }
  }

  private _handleLocalResponse(input: string) {
    // 检查是否是测试用例创建请求
    if (this._handleTestCaseCreation(input)) {
      return;
    }

    // 本地模式：解析输入并创建模拟响应
    const parsedCall = skillMatcher.parseSkillCall(input);

    if (parsedCall) {
      // 创建草稿并显示
      const draft = requirementManager.createDraft(
        (parsedCall.params.title as string) || "新需求",
        (parsedCall.params.description as string) || input,
        [parsedCall.skillName],
        parsedCall.params
      );

      this.pendingDrafts = requirementManager.getPendingReviewDrafts();

      this._addAssistantMessage(`已创建需求草稿（本地模式）：\n- 技能：${parsedCall.skillName}\n- 标题：${draft.title}\n\n待审核后可查看文档`);
    } else {
      this._addAssistantMessage(`收到消息（本地模式，未连接 Gateway）：${input}\n\n提示：使用 @project-manager 创建需求`);
    }
  }

  private _addAssistantMessage(content: string, artifact?: { kind: string; content: string }) {
    const msg: ChatMessage = {
      id: generateUUID(),
      role: "assistant",
      content,
      timestamp: Date.now(),
      artifact,
    };
    this.messages = [...this.messages, msg];
  }

  private _handleTestCaseCreation(input: string) {
    // 检测是否包含测试用例创建关键词
    const testCaseKeywords = [
      "测试用例", "创建测试", "test case", "test",
      "功能测试", "性能测试", "安全测试", "集成测试"
    ];

    const hasTestCaseKeyword = testCaseKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasTestCaseKeyword) {
      // 创建测试用例
      const draft = testcaseManager.createFromKeywords(input);
      const artifactContent = testcaseManager.toArtifactContent(draft);

      // 显示测试用例 artifact
      this.currentArtifact = {
        kind: "testcase",
        data: artifactContent as unknown as Record<string, unknown>,
      };

      // 添加助手消息，包含 artifact 引用
      this._addAssistantMessage(
        `已创建测试用例：**${draft.title}**\n\n类型：${draft.type}\n优先级：${draft.priority}\n\n共 ${draft.steps?.length || 0} 个测试步骤。`,
        {
          kind: "testcase",
          content: JSON.stringify(artifactContent),
        }
      );

      return true;
    }

    return false;
  }

  private _handleInputKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this._sendMessage();
    }
  }

  private _handleInput(e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.inputValue = value;

    // 实时匹配技能
    if (value.trim()) {
      const matches = skillMatcher.match(value);
      this.matchedSkills = matches.slice(0, 3);
      this.showSkills = matches.length > 0;
    } else {
      this.showSkills = false;
    }
  }

  private _selectSkill(skillName: string) {
    this.inputValue = `@${skillName} `;
    this.showSkills = false;
  }

  private _submitDraft(draft: RequirementDraft) {
    requirementManager.submitForReview(draft.id);
    this.pendingDrafts = requirementManager.getPendingReviewDrafts();
  }

  private _approveDraft(draft: RequirementDraft) {
    const requirement = requirementManager.approveToRequirement(draft);

    // 显示 artifact
    this.currentArtifact = {
      kind: "project-requirement",
      data: {
        requirement,
      },
    };

    // 从待审核列表移除
    this.pendingDrafts = this.pendingDrafts.filter((d) => d.id !== draft.id);
  }

  render() {
    return html`
      <div class="header">
        <h1>ChatLite</h1>
        <div class="connection-status">
          <span class="status-dot ${this.isGatewayConnected ? "connected" : this.isConnecting ? "connecting" : ""}"></span>
          <span>${this.isGatewayConnected ? "已连接" : this.isConnecting ? "连接中..." : "未连接"}</span>
        </div>
      </div>

      <div class="main">
        <div class="chat-panel">
          <div class="messages">
            ${this.messages.map(
              (msg) => html`
                <div class="message ${msg.role}">
                  <div class="message-avatar">
                    ${msg.role === "user" ? "U" : "A"}
                  </div>
                  <div class="message-content">
                    <div class="message-bubble">${msg.content}</div>
                    <div class="message-time">${formatTime(msg.timestamp)}</div>
                    ${msg.artifact
                      ? html`
                          <div
                            class="message-artifact"
                            @click=${() =>
                              (this.currentArtifact = {
                                kind: msg.artifact!.kind,
                                data: JSON.parse(msg.artifact!.content),
                              })}
                          >
                            📎 查看 ${msg.artifact.kind}
                          </div>
                        `
                      : ""}
                  </div>
                </div>
              `
            )}
          </div>

          <div class="input-area">
            <div class="input-wrapper">
              ${this.showSkills
                ? html`
                    <div class="skills-dropdown">
                      ${this.matchedSkills.map(
                        (match) => html`
                          <div
                            class="skill-item"
                            @click=${() => this._selectSkill(match.skill.name)}
                          >
                            <div class="skill-name">${match.skill.name}</div>
                            <div class="skill-desc">${match.skill.description}</div>
                          </div>
                        `
                      )}
                    </div>
                  `
                : ""}
              <input
                type="text"
                value=${this.inputValue}
                @input=${this._handleInput}
                @keydown=${this._handleInputKeydown}
                placeholder="输入消息或 @技能名称..."
              />
            </div>
            <button
              class="btn-send"
              ?disabled=${!this.inputValue.trim()}
              @click=${this._sendMessage}
            >
              发送
            </button>
          </div>

          ${this.pendingDrafts.length > 0
            ? html`
                <div class="pending-review">
                  <h3>待审核需求文档</h3>
                  ${this.pendingDrafts.map(
                    (draft) => html`
                      <div class="draft-item">
                        <div class="draft-title">${draft.title}</div>
                        <div class="draft-actions">
                          <button
                            class="btn-secondary btn-sm"
                            @click=${() => this._submitDraft(draft)}
                          >
                            提交
                          </button>
                          <button
                            class="btn-send btn-sm"
                            @click=${() => this._approveDraft(draft)}
                          >
                            批准
                          </button>
                        </div>
                      </div>
                    `
                  )}
                </div>
              `
            : ""}
        </div>

        ${this.showArtifactPanel ? html`
          <div 
            class="resize-handle ${this.isResizing ? 'resizing' : ''}"
            @mousedown=${this._handleResizeStart}
          ></div>

          <div 
            class="artifact-panel"
            style="width: ${this.artifactPanelWidth}px"
          >
            <div class="artifact-header">
              <h2>📎 ${this.currentArtifact?.kind || 'Artifact'}</h2>
              <button 
                class="artifact-close"
                @click=${this._closeArtifactPanel}
              >
                ✕
              </button>
            </div>
            
            <div class="artifact-content">
              ${this.currentArtifact ? html`
                <chatlite-artifact-viewer
                  .content=${this.currentArtifact}
                  .editable=${true}
                ></chatlite-artifact-viewer>
              ` : html`
                <div class="empty-artifact">
                  选择一个 artifact 查看<br/>
                  技能调用后会自动显示相关文档
                </div>
              `}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _handleResizeStart(_e: MouseEvent) {
    this.isResizing = true;
    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleResizeEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  private _handleResizeMove = (e: MouseEvent) => {
    if (!this.isResizing) return;
    
    const container = this.shadowRoot?.querySelector('.main') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    
    const minWidth = 300;
    const maxWidth = 800;
    this.artifactPanelWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
  }

  private _handleResizeEnd() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this._handleResizeMove);
    document.removeEventListener('mouseup', this._handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  private _closeArtifactPanel() {
    this.showArtifactPanel = false;
    this.currentArtifact = null;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-app": ChatLiteApp;
  }
}
