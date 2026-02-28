/**
 * ChatLite 流程模拟测试
 * 
 * 测试场景：用户创建项目需求
 * 输入：@project-manager 创建需求 标题：登录功能 描述：用户需要通过邮箱登录
 */

// 模拟依赖
const generateUUID = () => `uuid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ============================================
// 1. 模拟 SkillMatcher
// ============================================

class SkillMatcher {
  constructor() {
    this.skills = [
      {
        name: "project-manager",
        description: "项目管理全流程：需求分析、任务拆解与进度跟踪",
        parameters: { action: "string", title: "string", description: "string" }
      },
      {
        name: "requirement-analyzer",
        description: "需求分析与文档生成",
        parameters: { content: "string", format: "string" }
      }
    ];
  }

  parseSkillCall(userInput) {
    console.log("\n📋 [SkillMatcher] 解析输入:", userInput);
    
    // @提及格式检测
    const mentionMatch = userInput.match(/@(\S+)\s*(.*)/);
    if (mentionMatch) {
      const [, skillName, rest] = mentionMatch;
      console.log(`  ✓ 检测到 @提及格式: skill=${skillName}`);
      return this.parseMentionedSkill(skillName, rest || "", userInput);
    }

    // /命令格式检测
    const commandMatch = userInput.match(/^\/(\S+)\s*(.*)/);
    if (commandMatch) {
      const [, skillName, rest] = commandMatch;
      console.log(`  ✓ 检测到 /命令格式: skill=${skillName}`);
      return this.parseMentionedSkill(skillName, rest || "", userInput);
    }

    // 自然语言匹配
    const matches = this.match(userInput);
    console.log(`  → 自然语言匹配结果：${matches.length} 个 (最高置信度：${matches[0]?.confidence.toFixed(2) || 0})`);
    if (matches.length > 0 && matches[0].confidence > 0.4) {  // 降低阈值到 0.4
      console.log(`  ✓ 自然语言匹配：skill=${matches[0].skill.name} (置信度：${matches[0].confidence.toFixed(2)})`);
      return {
        skillName: matches[0].skill.name,
        params: matches[0].extractedParams,
        rawInput: userInput
      };
    }

    return null;
  }

  match(userInput) {
    const results = [];
    const normalizedInput = userInput.toLowerCase();

    for (const skill of this.skills) {
      const skillDesc = skill.description.toLowerCase();
      let confidence = 0;
      const extractedParams = {};

      // 关键词匹配
      const keywords = ["需求", "项目", "任务", "管理", "创建", "功能", "文档"];
      const matchedKeywords = keywords.filter(kw => normalizedInput.includes(kw));
      confidence += matchedKeywords.length * 0.12;  // 提高权重

      // 自然语言模式检测
      const naturalPatterns = [
        /创建 (.+?) 需求/i,
        /生成 (.+?) 文档/i,
        /帮我 [^的]+的 (.+?) 需求/i,
        /帮我 (.+?)(?:的 | 需求 | 项目 | 功能)/i,
        /需要 (.+?) 功能/i,
      ];
      for (const pattern of naturalPatterns) {
        const match = userInput.match(pattern);
        if (match) {
          extractedParams.title = match[1]?.trim() || "新需求";
          extractedParams.description = userInput;
          confidence += 0.4;  // 提高自然语言匹配置信度
          break;
        }
      }

      if (confidence > 0.3) {  // 阈值保持不变
        results.push({ skill, confidence, extractedParams });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  parseMentionedSkill(skillName, rest, rawInput) {
    const parts = rest.trim().split(/\s+/);
    const action = parts[0] || undefined;
    const paramStrings = parts.slice(1);
    const params = {};

    console.log(`  → action: ${action}`);

    // 1. 解析 key=value 格式 (支持中文键)
    for (const param of paramStrings) {
      const [key, ...valueParts] = param.split("=");
      if (key && valueParts.length > 0) {
        params[key] = valueParts.join("=");
        console.log(`  → param (key=value): ${key} = ${params[key]}`);
      }
    }

    // 2. 解析中文格式：标题：xxx 描述：xxx (支持中英文冒号)
    const titleMatch = rawInput.match(/标题\s*[:：]\s*([^\s,，.。.]+)/);
    if (titleMatch) {
      params.title = titleMatch[1].trim();
      console.log(`  → param (中文): title = ${params.title}`);
    }

    const descMatch = rawInput.match(/描述\s*[:：]\s*(.+?)(?:[.。]|$)/);
    if (descMatch) {
      params.description = descMatch[1].trim();
      console.log(`  → param (中文): description = ${params.description}`);
    }

    // 3. 如果没有参数，使用 rest 作为 description
    if (Object.keys(params).length === 0 && rest.trim()) {
      params.description = rest.trim();
      console.log(`  → param (默认): description = ${params.description}`);
    }

    return { skillName, action, params, rawInput };
  }
}

// ============================================
// 2. 模拟 RequirementManager
// ============================================

class RequirementManager {
  constructor() {
    this.drafts = new Map();
    this.requirements = new Map();
  }

  createDraft(title, description, skills = [], parameters = {}) {
    console.log("\n📝 [RequirementManager] 创建草稿");
    console.log(`  → title: ${title}`);
    console.log(`  → description: ${description}`);
    console.log(`  → skills: ${skills.join(", ")}`);

    const draft = {
      id: generateUUID(),
      title,
      description,
      skills,
      parameters,
      createdAt: Date.now(),
      status: "draft"
    };

    this.drafts.set(draft.id, draft);
    console.log(`  ✓ 草稿已创建，ID: ${draft.id}`);
    console.log(`  → status: ${draft.status}`);
    return draft;
  }

  submitForReview(id) {
    console.log("\n📤 [RequirementManager] 提交审核");
    const draft = this.drafts.get(id);
    if (draft) {
      draft.status = "pending_review";
      console.log(`  ✓ 状态更新：draft → pending_review`);
      return draft;
    }
    return null;
  }

  approveToRequirement(draft) {
    console.log("\n✅ [RequirementManager] 批准需求");
    const requirement = {
      id: draft.id,
      title: draft.title,
      description: draft.description,
      status: "approved",
      createdAt: draft.createdAt,
      updatedAt: Date.now()
    };
    this.requirements.set(requirement.id, requirement);
    console.log(`  ✓ 已转换为正式需求`);
    return requirement;
  }

  getPendingReviewDrafts() {
    return Array.from(this.drafts.values()).filter(d => d.status === "pending_review");
  }
}

// ============================================
// 3. 模拟 ChatClient (Gateway 通信)
// ============================================

class ChatClient {
  constructor() {
    this.connected = false;
    this.messageHandlers = [];
  }

  async connect(gatewayUrl) {
    console.log("\n🔌 [ChatClient] 连接 Gateway");
    console.log(`  → URL: ${gatewayUrl}`);
    // 模拟连接延迟
    await new Promise(r => setTimeout(r, 50));
    this.connected = true;
    console.log(`  ✓ 连接成功`);
  }

  isConnected() {
    return this.connected;
  }

  async invokeSkill(skillName, params) {
    console.log("\n🚀 [ChatClient] 调用技能");
    console.log(`  → skill: ${skillName}`);
    console.log(`  → params:`, JSON.stringify(params, null, 2));
    
    // 模拟 Gateway 处理延迟
    await new Promise(r => setTimeout(r, 100));
    
    console.log(`  ✓ RPC 请求已发送：skill.${skillName}`);
    
    // 模拟 Gateway 返回结果
    return {
      success: true,
      artifact: {
        kind: "project-requirement",
        content: JSON.stringify({
          requirement: {
            id: generateUUID(),
            title: params.title || "新需求",
            description: params.description || "",
            status: "approved",
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        })
      }
    };
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // 模拟接收 Gateway 消息
  simulateIncomingMessage(msg) {
    console.log("\n📥 [ChatClient] 收到 Gateway 消息");
    console.log(`  → role: ${msg.role}`);
    console.log(`  → content: ${msg.content?.substring(0, 50)}...`);
    if (msg.artifact) {
      console.log(`  → artifact: ${msg.artifact.kind}`);
    }
    this.messageHandlers.forEach(h => h(msg));
  }
}

// ============================================
// 4. 模拟 Artifact 显示
// ============================================

class ArtifactViewer {
  display(content) {
    console.log("\n🎨 [ArtifactViewer] 渲染 Artifact");
    console.log(`  → kind: ${content.kind}`);
    
    if (content.kind === "project-requirement") {
      const req = content.data.requirement;
      console.log("\n  ┌─────────────────────────────────────────┐");
      console.log(`  │  📄 ${req.title}`);
      console.log(`  │  状态：${this.getStatusEmoji(req.status)} ${req.status}`);
      console.log(`  │  ─────────────────────────────────────  │`);
      console.log(`  │  ${req.description.substring(0, 40)}${req.description.length > 40 ? '...' : ''}`);
      console.log(`  │  ─────────────────────────────────────  │`);
      console.log(`  │  ID: ${req.id.substring(0, 20)}...`);
      console.log(`  │  创建：${new Date(req.createdAt).toLocaleTimeString()}`);
      console.log("  └─────────────────────────────────────────┘");
    }
  }

  getStatusEmoji(status) {
    const map = { draft: "📝", pending_review: "⏳", approved: "✅", rejected: "❌" };
    return map[status] || "📄";
  }
}

// ============================================
// 5. 模拟主应用 (App Component)
// ============================================

class ChatLiteApp {
  constructor() {
    this.chatClient = new ChatClient();
    this.skillMatcher = new SkillMatcher();
    this.requirementManager = new RequirementManager();
    this.artifactViewer = new ArtifactViewer();
    this.messages = [];
    this.currentArtifact = null;
  }

  async initialize() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 ChatLite 应用初始化");
    console.log("=".repeat(60));
    await this.chatClient.connect("ws://localhost:18789");
    
    // 监听消息
    this.chatClient.onMessage((msg) => this.handleIncomingMessage(msg));
  }

  async sendMessage(userInput) {
    console.log("\n" + "=".repeat(60));
    console.log("💬 用户输入:", userInput);
    console.log("=".repeat(60));

    // 添加用户消息
    this.messages.push({
      id: generateUUID(),
      role: "user",
      content: userInput,
      timestamp: Date.now()
    });

    // 解析技能调用
    const parsedCall = this.skillMatcher.parseSkillCall(userInput);

    if (parsedCall) {
      console.log("\n✓ 匹配到技能调用");
      console.log(`  skillName: ${parsedCall.skillName}`);
      console.log(`  action: ${parsedCall.action}`);

      // 创建需求草稿 - 优先使用解析出的参数
      const draft = this.requirementManager.createDraft(
        parsedCall.params.title || parsedCall.params.标题 || "新需求",
        parsedCall.params.description || parsedCall.params.描述 || userInput,
        [parsedCall.skillName],
        parsedCall.params
      );

      // 调用技能
      const result = await this.chatClient.invokeSkill(parsedCall.skillName, {
        action: parsedCall.action,
        ...parsedCall.params
      });

      // 模拟 Gateway 返回带 artifact 的消息
      if (result.artifact) {
        this.chatClient.simulateIncomingMessage({
          id: generateUUID(),
          role: "assistant",
          content: `已创建项目需求：${draft.title}`,
          artifact: result.artifact
        });
      }
    } else {
      console.log("\n⚠ 未匹配到技能，作为普通消息发送");
    }
  }

  handleIncomingMessage(msg) {
    this.messages.push(msg);

    // 如果包含 artifact，显示它
    if (msg.artifact) {
      this.currentArtifact = {
        kind: msg.artifact.kind,
        data: JSON.parse(msg.artifact.content)
      };
      this.artifactViewer.display(this.currentArtifact);
    }
  }

  // 模拟用户审核流程
  async approveDraft(draftId) {
    console.log("\n" + "=".repeat(60));
    console.log("👤 用户操作：批准需求");
    console.log("=".repeat(60));

    const draft = this.requirementManager.drafts.get(draftId);
    if (draft) {
      this.requirementManager.submitForReview(draftId);
      const requirement = this.requirementManager.approveToRequirement(draft);
      
      // 更新 artifact 显示
      this.currentArtifact = {
        kind: "project-requirement",
        data: { requirement }
      };
      this.artifactViewer.display(this.currentArtifact);
    }
  }
}

// ============================================
// 6. 运行测试
// ============================================

async function runTest() {
  const app = new ChatLiteApp();
  
  // 初始化
  await app.initialize();

  // 测试用例 1: 创建项目需求
  await app.sendMessage(
    "@project-manager 创建需求 标题：登录功能 描述：用户需要通过邮箱登录"
  );

  // 获取草稿 ID 进行批准
  const drafts = app.requirementManager.getPendingReviewDrafts();
  if (drafts.length > 0) {
    await app.approveDraft(drafts[0].id);
  }

  // 测试用例 2: 自然语言输入
  console.log("\n\n" + "=".repeat(60));
  console.log("🧪 测试用例 2: 自然语言输入");
  console.log("=".repeat(60));
  
  await app.sendMessage(
    "帮我创建一个用户注册功能的需求文档"
  );

  // 测试用例 3: /命令格式
  console.log("\n\n" + "=".repeat(60));
  console.log("🧪 测试用例 3: /命令格式");
  console.log("=".repeat(60));
  
  await app.sendMessage(
    "/project-manager create 标题=支付模块 描述=支持支付宝和微信支付"
  );

  // 总结
  console.log("\n\n" + "=".repeat(60));
  console.log("✅ 测试完成");
  console.log("=".repeat(60));
  console.log(`总消息数：${app.messages.length}`);
  console.log(`草稿数：${app.requirementManager.drafts.size}`);
  console.log(`正式需求数：${app.requirementManager.requirements.size}`);
}

// 执行测试
runTest().catch(console.error);
