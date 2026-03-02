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
  private agents: Map<string, any> = new Map();
  private configs: AgentConfig[] = [];
  private statusMap: Map<string, AgentStatus> = new Map();
  private healthCheckTimer?: number;

  constructor(private configPath?: string) {}

  /**
   * 加载智能体配置
   */
  async loadAgents(configs: AgentConfig[]) {
    this.configs = configs;
    
    console.log(`🤖 加载 ${configs.length} 个智能体...`);
    
    for (const config of configs) {
      if (config.status === 'active') {
        await this.connectAgent(config);
      }
    }

    // 启动健康检查
    this.startHealthCheck();
  }

  /**
   * 连接单个智能体
   */
  private async connectAgent(config: AgentConfig) {
    try {
      console.log(`🔌 连接智能体：${config.name} (${config.gateway.url})`);
      
      // 创建 WebSocket 连接
      const wsUrl = new URL(config.gateway.url);
      wsUrl.searchParams.set('token', config.gateway.token);
      const ws = new WebSocket(wsUrl.toString());

      // 等待连接
      await new Promise((resolve, reject) => {
        ws.on('open', () => {
          console.log(`✅ ${config.name} 连接成功`);
          this.agents.set(config.id, { config, ws });
          this.updateStatus(config.id, { connected: true });
          resolve(true);
        });

        ws.on('error', (err) => {
          console.error(`❌ ${config.name} 连接失败:`, err.message);
          this.updateStatus(config.id, { 
            connected: false, 
            error: err.message 
          });
          reject(err);
        });

        ws.on('close', () => {
          console.log(`🔌 ${config.name} 连接关闭`);
          this.updateStatus(config.id, { connected: false });
          
          // 自动重连
          if (config.status === 'active') {
            setTimeout(() => this.connectAgent(config), 5000);
          }
        });
      });

    } catch (error) {
      console.error(`连接智能体 ${config.name} 失败:`, error);
      throw error;
    }
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

    return new Promise((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random()}`;
      
      // 设置超时
      const timeout = setTimeout(() => {
        reject(new Error('消息发送超时'));
      }, 30000);

      // 监听响应
      const messageHandler = (data: any) => {
        const response = JSON.parse(data.toString());
        
        if (response.id === requestId) {
          clearTimeout(timeout);
          agent.ws.removeListener('message', messageHandler);
          
          this.updateStatus(agentId, { 
            messageCount: (this.statusMap.get(agentId)?.messageCount || 0) + 1 
          });
          
          resolve(response);
        }
      };

      agent.ws.on('message', messageHandler);

      // 发送消息
      agent.ws.send(JSON.stringify({
        id: requestId,
        kind: 'req',
        method: 'chat.send',
        params: {
          message: message,
          timestamp: Date.now()
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
   * 添加智能体
   */
  async addAgent(config: AgentConfig) {
    this.configs.push(config);
    await this.connectAgent(config);
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
      this.statusMap.forEach((status, agentId) => {
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
