import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiConnectorConfig, ApiRequest, OperationResult } from "./types";

export class ApiConnector {
  private connectors: Map<string, AxiosInstance>;
  private configs: Map<string, ApiConnectorConfig>;

  constructor(configs: ApiConnectorConfig[]) {
    this.connectors = new Map();
    this.configs = new Map();

    this.initializeConnectors(configs);
  }

  private initializeConnectors(configs: ApiConnectorConfig[]): void {
    for (const config of configs) {
      this.createConnector(config);
    }
  }

  private createConnector(config: ApiConnectorConfig): void {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };

    // 如果配置了认证
    if (config.auth) {
      if (config.auth.type === "bearer" && config.auth.token) {
        axiosConfig.headers = {
          ...axiosConfig.headers,
          Authorization: `Bearer ${config.auth.token}`,
        };
      } else if (config.auth.type === "apikey" && config.auth.apiKey) {
        if (config.auth.location === "header") {
          axiosConfig.headers = {
            ...axiosConfig.headers,
            [config.auth.keyName || "X-API-Key"]: config.auth.apiKey,
          };
        } else if (config.auth.location === "query") {
          axiosConfig.params = {
            [config.auth.keyName || "api_key"]: config.auth.apiKey,
          };
        }
      }
    }

    const instance = axios.create(axiosConfig);

    // 添加请求拦截器
    instance.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
      },
    );

    // 添加响应拦截器
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error("API Response Error:", error.response?.status, error.response?.data);
        return Promise.reject(error);
      },
    );

    this.connectors.set(config.name, instance);
    this.configs.set(config.name, config);
  }

  async initialize(): Promise<void> {
    console.log(`Initialized ${this.connectors.size} API connectors`);
  }

  async execute(request: ApiRequest): Promise<OperationResult> {
    const connector = this.connectors.get(request.endpoint);

    if (!connector) {
      return {
        success: false,
        message: `未找到API连接器: ${request.endpoint}`,
        data: null,
        timestamp: new Date(),
      };
    }

    try {
      let response: AxiosResponse;

      switch (request.method.toUpperCase()) {
        case "GET":
          response = await connector.get(request.path || "", {
            params: request.parameters,
          });
          break;

        case "POST":
          response = await connector.post(request.path || "", request.data || request.parameters);
          break;

        case "PUT":
          response = await connector.put(request.path || "", request.data || request.parameters);
          break;

        case "DELETE":
          response = await connector.delete(request.path || "", {
            params: request.parameters,
          });
          break;

        case "PATCH":
          response = await connector.patch(request.path || "", request.data || request.parameters);
          break;

        default:
          return {
            success: false,
            message: `不支持的HTTP方法: ${request.method}`,
            data: null,
            timestamp: new Date(),
          };
      }

      return {
        success: true,
        message: "API请求成功",
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          requestId: request.id,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error(`API request failed for ${request.endpoint}:`, error);

      return {
        success: false,
        message: `API请求失败: ${error.message}`,
        data: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          error: error.response?.data,
          requestId: request.id,
        },
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  // 预定义的API连接器配置
  static getPredefinedConfigs(): ApiConnectorConfig[] {
    return [
      {
        id: "crm",
        name: "crm",
        baseUrl: "https://api.crm.example.com",
        timeout: 30000,
        auth: {
          type: "bearer",
          token: process.env.CRM_API_TOKEN || "your-crm-token",
        },
        headers: {
          Accept: "application/json",
        },
      },
      {
        id: "erp",
        name: "erp",
        baseUrl: "https://api.erp.example.com",
        timeout: 45000,
        auth: {
          type: "apikey",
          apiKey: process.env.ERP_API_KEY || "your-erp-api-key",
          keyName: "X-API-Key",
          location: "header",
        },
        headers: {
          Accept: "application/json",
          "X-Client-Version": "1.0.0",
        },
      },
      {
        id: "ecommerce",
        name: "ecommerce",
        baseUrl: "https://api.ecommerce.example.com",
        timeout: 25000,
        auth: {
          type: "bearer",
          token: process.env.ECOMMERCE_API_TOKEN || "your-ecommerce-token",
        },
        headers: {
          Accept: "application/json",
          "X-Store-ID": "store-123",
        },
      },
      {
        id: "inventory",
        name: "inventory",
        baseUrl: "https://api.inventory.example.com",
        timeout: 20000,
        auth: {
          type: "apikey",
          apiKey: process.env.INVENTORY_API_KEY || "your-inventory-api-key",
          keyName: "api_key",
          location: "query",
        },
      },
      {
        id: "analytics",
        name: "analytics",
        baseUrl: "https://api.analytics.example.com",
        timeout: 35000,
        auth: {
          type: "bearer",
          token: process.env.ANALYTICS_API_TOKEN || "your-analytics-token",
        },
        headers: {
          Accept: "application/json",
          "X-Analytics-Version": "2.0",
        },
      },
    ];
  }

  // 批量执行多个API请求
  async executeBatch(requests: ApiRequest[]): Promise<OperationResult[]> {
    const promises = requests.map((request) => this.execute(request));
    return Promise.all(promises);
  }

  // 获取连接器状态
  getConnectorStatus(endpoint: string): boolean {
    return this.connectors.has(endpoint);
  }

  getAllConnectors(): string[] {
    return Array.from(this.connectors.keys());
  }

  // 动态添加新的API连接器
  addConnector(config: ApiConnectorConfig): void {
    this.createConnector(config);
  }

  // 移除API连接器
  removeConnector(name: string): boolean {
    const removed = this.connectors.delete(name);
    this.configs.delete(name);
    return removed;
  }

  // 更新现有连接器配置
  updateConnector(name: string, config: Partial<ApiConnectorConfig>): void {
    const existingConfig = this.configs.get(name);
    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...config };
      this.removeConnector(name);
      this.addConnector(updatedConfig);
    }
  }
}
