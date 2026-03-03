/**
 * 多智能体客户端管理
 * 支持多个 Gateway 连接和消息路由
 */

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  gateway: {
    url: string;
    token: string;
    type: 'local' | 'public' | 'private';
  };
  model: string;
  skills: string[];
  status: 'active' | 'inactive';
  priority: number;
}

export interface AgentStatus {
  id: string;
  name: string;
  connected: boolean;
  lastSeen?: number;
  messageCount: number;
  error?: string;
}

export class MultiAgentClient {
  // configPath 保留用于未来扩展
  private agents: Map<string, any> = new Map();
  private configs: AgentConfig[] = [];
  private statusMap: Map<string, AgentStatus> = new Map();
  private healthCheckTimer?: ReturnType<typeof setTimeout>;

  constructor() {}

  /**
   * 加载智能体配置（单个失败不影响其他）
   */
  async loadAgents(configs: AgentConfig[]) {
    this.configs = configs;
    
    console.log(`🤖 加载 ${configs.length} 个智能体...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const config of configs) {
      if (config.status === 'active') {
        try {
          await this.connectAgent(config);
          successCount++;
        } catch (error) {
          failCount++;
          console.warn(`⚠️ 智能体 ${config.name} 连接失败，继续加载其他智能体`);
          // 更新状态为离线
          this.updateStatus(config.id, {
            connected: false,
            error: (error as Error).message
          });
        }
      }
    }

    console.log(`✅ 加载完成：成功 ${successCount}, 失败 ${failCount}`);
    
    // 启动健康检查
    this.startHealthCheck();
  }

  /**
   * 连接单个智能体（实现 Gateway 挑战 - 响应认证）
   */
  private async connectAgent(config: AgentConfig) {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log(`🔌 连接智能体：${config.name} (${config.gateway.url})`);

        // 创建 WebSocket 连接（不直接在 URL 中传 token）
        const ws = new WebSocket(config.gateway.url);
        let connectTimeoutId: any;

        // 连接超时
        const startTimeout = () => {
          connectTimeoutId = setTimeout(() => {
            ws.close();
            reject(new Error('连接超时（10 秒）'));
          }, 10000);
        };

        // 监听消息（处理挑战 - 响应认证）
        ws.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data as string);
            
            // 处理 connect.challenge 事件
            if (message.type === 'event' && message.event === 'connect.challenge') {
              const nonce = message.payload?.nonce;
              if (nonce) {
                console.log(`[Gateway] 收到挑战 nonce: ${nonce.substring(0, 8)}...`);
                
                // 发送 connect 请求响应挑战
                const connectFrame = {
                  type: 'req' as const,
                  id: `connect-${Date.now()}`,
                  method: 'connect',
                  params: {
                    minProtocol: 3,
                    maxProtocol: 3,
                    client: {
                      id: 'webchat-ui',  // Gateway 要求的固定值
                      version: '0.1.0',
                      platform: 'web',
                      mode: 'webchat'
                    },
                    role: 'operator',
                    scopes: ['operator.admin', 'operator.approvals'],
                    caps: [],
                    auth: {
                      token: config.gateway.token
                    }
                  }
                };
                
                ws.send(JSON.stringify(connectFrame));
              }
              return;
            }
            
            // 处理 connect 响应
            if (message.type === 'res' && message.id?.startsWith('connect-')) {
              if (message.ok) {
                console.log(`✅ ${config.name} 认证成功`);
                clearTimeout(connectTimeoutId);
                this.agents.set(config.id, { config, ws });
                this.updateStatus(config.id, { connected: true });
                resolve();
              } else {
                console.error(`❌ ${config.name} 认证失败:`, message.error?.message);
                clearTimeout(connectTimeoutId);
                ws.close();
                reject(new Error(message.error?.message || '认证失败'));
              }
              return;
            }
          } catch (parseError) {
            console.warn('[Gateway] 解析消息失败:', parseError);
          }
        };

        ws.onopen = () => {
          console.log(`[Gateway] WebSocket 已打开，等待挑战...`);
          startTimeout();
        };

        ws.onerror = (_err: Event) => {
          clearTimeout(connectTimeoutId);
          console.error(`❌ ${config.name} 连接错误`);
          this.updateStatus(config.id, {
            connected: false,
            error: 'WebSocket 连接失败'
          });
          reject(new Error('WebSocket 连接失败'));
        };

        ws.onclose = (event: CloseEvent) => {
          clearTimeout(connectTimeoutId);
          console.log(`🔌 ${config.name} 连接关闭：code=${event.code}, reason=${event.reason}`);
          this.updateStatus(config.id, { connected: false });
        };

      } catch (error) {
        console.error(`连接智能体 ${config.name} 失败:`, error);
        reject(error);
      }
    });
  }

  /**
   * 发送消息到指定智能体
   */
  async sendMessage(agentId: string, message: string) {
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`智能体 ${agentId} 不存在`);
    }

    if (!agent.ws || agent.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`智能体 ${agentId} 未连接`);
    }

    console.log(`📤 发送消息到 ${agent.config.name}: ${message}`);

    const requestId = `req-${Date.now()}-${Math.random()}`;
    const sessionKey = `session-${agentId}`;
    const idempotencyKey = `idem-${Date.now()}-${Math.random()}`;
    let runId: string | null = null;
    let replyContent = '';
    let replyReceived = false;

    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        if (!replyReceived) {
          reject(new Error('消息发送超时（30 秒）'));
        }
      }, 30000);

      // 监听响应和事件
      const originalOnMessage = agent.ws.onmessage;
      agent.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          console.log('[Gateway] 收到消息:', JSON.stringify(data, null, 2).substring(0, 500));
          
          // 处理 chat.send 的响应（返回 runId）
          if (data.type === 'res' && data.id === requestId) {
            console.log('[Gateway] 收到 chat.send 响应:', data.ok ? '成功' : '失败', data);
            if (data.ok) {
              runId = data.payload?.runId;
              console.log(`✅ 消息已发送，runId: ${runId}`);
            } else {
              clearTimeout(timeout);
              agent.ws.onmessage = originalOnMessage;
              reject(new Error(data.error?.message || '发送失败'));
            }
            return;
          }
          
          // 处理所有 event 类型消息
          if (data.type === 'event') {
            console.log('[Gateway] 收到事件:', data.event, data.payload);
            
            // 处理 chat 事件（AI 回复）- Gateway 使用的事件名
            if (data.event === 'chat') {
              const payload = data.payload;
              // 只处理 final 状态的完整回复
              if (payload?.runId === runId && payload?.state === 'final' && payload?.message?.role === 'assistant') {
                // 提取文本内容
                const content = payload.message.content;
                if (Array.isArray(content)) {
                  replyContent = content.map(c => c.text || c.content || JSON.stringify(c)).join('\n');
                } else {
                  replyContent = content?.text || content?.content || JSON.stringify(content);
                }
                replyReceived = true;
                clearTimeout(timeout);
                agent.ws.onmessage = originalOnMessage;
                
                this.updateStatus(agentId, {
                  messageCount: (this.statusMap.get(agentId)?.messageCount || 0) + 1
                });
                
                console.log('[Gateway] 收到 AI 完整回复:', replyContent.substring(0, 200));
                resolve({
                  id: requestId,
                  runId,
                  reply: replyContent,
                  payload
                });
              }
              // delta 状态的消息只记录，不返回
              if (payload?.state === 'delta') {
                console.log('[Gateway] 收到 AI 流式片段:', payload?.message?.content?.[0]?.text);
              }
              return;
            }
            
            // 处理 chat.message 事件（AI 回复）
            if (data.event === 'chat.message') {
              const payload = data.payload;
              if (payload?.runId === runId && payload?.role === 'assistant') {
                replyContent = payload?.content || payload?.text || JSON.stringify(payload);
                replyReceived = true;
                clearTimeout(timeout);
                agent.ws.onmessage = originalOnMessage;
                
                this.updateStatus(agentId, {
                  messageCount: (this.statusMap.get(agentId)?.messageCount || 0) + 1
                });
                
                console.log('[Gateway] 收到 AI 回复:', replyContent.substring(0, 100));
                resolve({
                  id: requestId,
                  runId,
                  reply: replyContent,
                  payload
                });
              }
              return;
            }
            
            // 处理 chat.reply 事件（另一种回复格式）
            if (data.event === 'chat.reply') {
              const payload = data.payload;
              if (payload?.runId === runId) {
                replyContent = payload?.content || payload?.text || JSON.stringify(payload);
                replyReceived = true;
                clearTimeout(timeout);
                agent.ws.onmessage = originalOnMessage;
                
                this.updateStatus(agentId, {
                  messageCount: (this.statusMap.get(agentId)?.messageCount || 0) + 1
                });
                
                console.log('[Gateway] 收到 AI 回复:', replyContent.substring(0, 100));
                resolve({
                  id: requestId,
                  runId,
                  reply: replyContent,
                  payload
                });
              }
              return;
            }
            
            // 处理 assistant.response 事件
            if (data.event === 'assistant.response') {
              const payload = data.payload;
              if (payload?.runId === runId) {
                replyContent = payload?.content || payload?.text || payload?.reply || JSON.stringify(payload);
                replyReceived = true;
                clearTimeout(timeout);
                agent.ws.onmessage = originalOnMessage;
                
                this.updateStatus(agentId, {
                  messageCount: (this.statusMap.get(agentId)?.messageCount || 0) + 1
                });
                
                console.log('[Gateway] 收到 AI 回复:', replyContent.substring(0, 100));
                resolve({
                  id: requestId,
                  runId,
                  reply: replyContent,
                  payload
                });
              }
              return;
            }
            return;
          }
          
          // 其他消息交给原始处理器
          if (originalOnMessage) {
            originalOnMessage(event);
          }
        } catch (parseError) {
          console.error('解析消息失败:', parseError);
        }
      };

      // 发送 chat.send 请求
      agent.ws.send(JSON.stringify({
        type: 'req',
        id: requestId,
        method: 'chat.send',
        params: {
          sessionKey: sessionKey,
          message: message,
          idempotencyKey: idempotencyKey,
          timeoutMs: 60000
        }
      }));
    });
  }

  /**
   * 广播消息到所有智能体
   */
  async broadcastMessage(message: string) {
    console.log(`📢 广播消息到 ${this.agents.size} 个智能体`);
    
    const results = await Promise.allSettled(
      Array.from(this.agents.keys()).map(id => 
        this.sendMessage(id, message).catch(err => ({ error: err.message }))
      )
    );

    return results.map((result, i) => ({
      agentId: this.configs[i].id,
      agentName: this.configs[i].name,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * 获取所有智能体状态
   */
  getAgentStatusList(): AgentStatus[] {
    return Array.from(this.statusMap.values());
  }

  /**
   * 获取智能体列表
   */
  getAgentList() {
    return this.configs.map(config => ({
      ...config,
      connected: this.agents.has(config.id),
      status: this.statusMap.get(config.id)
    }));
  }

  /**
   * 添加智能体（连接失败时自动回滚）
   */
  async addAgent(config: AgentConfig): Promise<boolean> {
    try {
      // 先尝试连接
      await this.connectAgent(config);
      // 连接成功后再添加到列表
      this.configs.push(config);
      console.log(`✅ 智能体 ${config.name} 已添加并连接`);
      return true;
    } catch (error) {
      console.error(`❌ 智能体 ${config.name} 添加失败:`, error);
      throw error;
    }
  }

  /**
   * 删除智能体
   */
  removeAgent(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.ws.close();
      this.agents.delete(agentId);
    }
    this.configs = this.configs.filter(c => c.id !== agentId);
    this.statusMap.delete(agentId);
  }

  /**
   * 启用/禁用智能体
   */
  toggleAgent(agentId: string, enable: boolean) {
    const config = this.configs.find(c => c.id === agentId);
    if (config) {
      config.status = enable ? 'active' : 'inactive';
      
      if (!enable) {
        this.removeAgent(agentId);
      } else {
        this.connectAgent(config);
      }
    }
  }

  /**
   * 更新智能体状态
   */
  private updateStatus(agentId: string, status: Partial<AgentStatus>) {
    const current = this.statusMap.get(agentId) || {
      id: agentId,
      name: this.configs.find(c => c.id === agentId)?.name || agentId,
      connected: false,
      messageCount: 0
    };

    this.statusMap.set(agentId, { ...current, ...status });
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck() {
    const interval = 30000; // 30 秒
    
    this.healthCheckTimer = setInterval(() => {
      this.statusMap.forEach((_status, agentId) => {
        const agent = this.agents.get(agentId);
        
        if (agent && agent.ws) {
          const isHealthy = agent.ws.readyState === WebSocket.OPEN;
          this.updateStatus(agentId, {
            connected: isHealthy,
            lastSeen: Date.now()
          });
        }
      });
    }, interval);
  }

  /**
   * 停止所有连接
   */
  disconnect() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.agents.forEach((agent) => {
      agent.ws?.close();
    });

    this.agents.clear();
    this.statusMap.clear();
  }
}
