import { BusinessOperation, OperationResult } from "./types";

export class BusinessOperationExecutor {
  private supportedOperations: Map<
    string,
    (operation: BusinessOperation) => Promise<OperationResult>
  >;

  constructor() {
    this.supportedOperations = new Map();
    this.initializeOperations();
  }

  private initializeOperations(): void {
    // 订单相关操作
    this.supportedOperations.set("order", this.executeOrderOperation.bind(this));
    this.supportedOperations.set("order_query", this.executeOrderQuery.bind(this));
    this.supportedOperations.set("order_update", this.executeOrderUpdate.bind(this));

    // 客户相关操作
    this.supportedOperations.set("customer", this.executeCustomerOperation.bind(this));
    this.supportedOperations.set("customer_query", this.executeCustomerQuery.bind(this));
    this.supportedOperations.set("customer_update", this.executeCustomerUpdate.bind(this));

    // 产品相关操作
    this.supportedOperations.set("product", this.executeProductOperation.bind(this));
    this.supportedOperations.set("product_query", this.executeProductQuery.bind(this));
    this.supportedOperations.set("product_update", this.executeProductUpdate.bind(this));

    // 库存相关操作
    this.supportedOperations.set("inventory", this.executeInventoryOperation.bind(this));
    this.supportedOperations.set("inventory_query", this.executeInventoryQuery.bind(this));
    this.supportedOperations.set("inventory_update", this.executeInventoryUpdate.bind(this));

    // 销售相关操作
    this.supportedOperations.set("sales", this.executeSalesOperation.bind(this));
    this.supportedOperations.set("sales_query", this.executeSalesQuery.bind(this));
    this.supportedOperations.set("sales_update", this.executeSalesUpdate.bind(this));

    // 财务相关操作
    this.supportedOperations.set("finance", this.executeFinanceOperation.bind(this));
    this.supportedOperations.set("finance_query", this.executeFinanceQuery.bind(this));
    this.supportedOperations.set("finance_update", this.executeFinanceUpdate.bind(this));

    // 通用操作
    this.supportedOperations.set("general", this.executeGeneralOperation.bind(this));
  }

  async execute(operation: BusinessOperation): Promise<OperationResult> {
    const executor = this.supportedOperations.get(operation.type);

    if (!executor) {
      return {
        success: false,
        message: `不支持的业务操作类型: ${operation.type}`,
        data: null,
        timestamp: new Date(),
      };
    }

    try {
      return await executor(operation);
    } catch (error) {
      console.error(`Business operation execution failed: ${operation.type}`, error);

      return {
        success: false,
        message: `执行业务操作时发生错误: ${error instanceof Error ? error.message : "未知错误"}`,
        data: null,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeOrderOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.orderId) {
      // 查询特定订单
      return {
        success: true,
        message: `订单 ${parameters.orderId} 查询成功`,
        data: {
          orderId: parameters.orderId,
          status: "已确认",
          totalAmount: 1250.0,
          customerName: "张三",
          orderDate: "2024-01-15",
          items: [
            { product: "产品A", quantity: 2, price: 500.0 },
            { product: "产品B", quantity: 1, price: 250.0 },
          ],
        },
        timestamp: new Date(),
      };
    } else {
      // 查询所有订单
      return {
        success: true,
        message: "订单列表查询成功",
        data: [
          { orderId: "ORD001", customerName: "张三", totalAmount: 1250.0, status: "已确认" },
          { orderId: "ORD002", customerName: "李四", totalAmount: 850.0, status: "处理中" },
          { orderId: "ORD003", customerName: "王五", totalAmount: 2100.0, status: "已发货" },
        ],
        timestamp: new Date(),
      };
    }
  }

  private async executeOrderQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeOrderOperation(operation);
  }

  private async executeOrderUpdate(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    return {
      success: true,
      message: `订单 ${parameters.orderId} 更新成功`,
      data: {
        orderId: parameters.orderId,
        updatedFields: parameters.updateData,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeCustomerOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.customerId || parameters.customerName) {
      // 查询特定客户
      return {
        success: true,
        message: "客户信息查询成功",
        data: {
          customerId: parameters.customerId || "CUST001",
          customerName: parameters.customerName || "张三",
          email: "zhangsan@example.com",
          phone: "13800138000",
          totalOrders: 15,
          totalSpent: 12500.0,
          registrationDate: "2023-01-15",
          status: "活跃",
        },
        timestamp: new Date(),
      };
    } else {
      // 查询所有客户
      return {
        success: true,
        message: "客户列表查询成功",
        data: [
          {
            customerId: "CUST001",
            customerName: "张三",
            email: "zhangsan@example.com",
            totalSpent: 12500.0,
            status: "活跃",
          },
          {
            customerId: "CUST002",
            customerName: "李四",
            email: "lisi@example.com",
            totalSpent: 8500.0,
            status: "活跃",
          },
          {
            customerId: "CUST003",
            customerName: "王五",
            email: "wangwu@example.com",
            totalSpent: 21000.0,
            status: "VIP",
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  private async executeCustomerQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeCustomerOperation(operation);
  }

  private async executeCustomerUpdate(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    return {
      success: true,
      message: `客户 ${parameters.customerId} 信息更新成功`,
      data: {
        customerId: parameters.customerId,
        updatedFields: parameters.updateData,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeProductOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.productId || parameters.productName) {
      // 查询特定产品
      return {
        success: true,
        message: "产品信息查询成功",
        data: {
          productId: parameters.productId || "PROD001",
          productName: parameters.productName || "产品A",
          category: "电子产品",
          price: 599.0,
          stock: 150,
          description: "高质量电子产品，性能优越",
          status: "在售",
          createdDate: "2023-06-15",
        },
        timestamp: new Date(),
      };
    } else {
      // 查询所有产品
      return {
        success: true,
        message: "产品列表查询成功",
        data: [
          {
            productId: "PROD001",
            productName: "产品A",
            category: "电子产品",
            price: 599.0,
            stock: 150,
            status: "在售",
          },
          {
            productId: "PROD002",
            productName: "产品B",
            category: "家居用品",
            price: 299.0,
            stock: 200,
            status: "在售",
          },
          {
            productId: "PROD003",
            productName: "产品C",
            category: "服装",
            price: 199.0,
            stock: 0,
            status: "缺货",
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  private async executeProductQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeProductOperation(operation);
  }

  private async executeProductUpdate(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    return {
      success: true,
      message: `产品 ${parameters.productId} 信息更新成功`,
      data: {
        productId: parameters.productId,
        updatedFields: parameters.updateData,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeInventoryOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.productId) {
      // 查询特定产品的库存
      return {
        success: true,
        message: "库存信息查询成功",
        data: {
          productId: parameters.productId,
          productName: "产品A",
          currentStock: 150,
          reservedStock: 20,
          availableStock: 130,
          reorderPoint: 50,
          lastUpdated: "2024-01-15 14:30:00",
        },
        timestamp: new Date(),
      };
    } else {
      // 查询所有库存
      return {
        success: true,
        message: "库存列表查询成功",
        data: [
          {
            productId: "PROD001",
            productName: "产品A",
            currentStock: 150,
            availableStock: 130,
            status: "充足",
          },
          {
            productId: "PROD002",
            productName: "产品B",
            currentStock: 200,
            availableStock: 180,
            status: "充足",
          },
          {
            productId: "PROD003",
            productName: "产品C",
            currentStock: 0,
            availableStock: 0,
            status: "缺货",
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  private async executeInventoryQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeInventoryOperation(operation);
  }

  private async executeInventoryUpdate(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    return {
      success: true,
      message: `库存 ${parameters.productId} 更新成功`,
      data: {
        productId: parameters.productId,
        updatedStock: parameters.newStock,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeSalesOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.dateRange) {
      // 按日期范围查询销售数据
      return {
        success: true,
        message: "销售数据查询成功",
        data: {
          dateRange: parameters.dateRange,
          totalSales: 125000.0,
          totalOrders: 450,
          averageOrderValue: 277.78,
          topProducts: [
            { productName: "产品A", sales: 45000.0, quantity: 75 },
            { productName: "产品B", sales: 35000.0, quantity: 117 },
            { productName: "产品C", sales: 25000.0, quantity: 125 },
          ],
          dailyBreakdown: [
            { date: "2024-01-01", sales: 5000.0, orders: 20 },
            { date: "2024-01-02", sales: 7500.0, orders: 25 },
            { date: "2024-01-03", sales: 6200.0, orders: 18 },
          ],
        },
        timestamp: new Date(),
      };
    } else {
      // 查询今日销售
      return {
        success: true,
        message: "今日销售数据查询成功",
        data: {
          date: "2024-01-15",
          totalSales: 12500.0,
          totalOrders: 45,
          averageOrderValue: 277.78,
          topProducts: [
            { productName: "产品A", sales: 4500.0, quantity: 8 },
            { productName: "产品B", sales: 3500.0, quantity: 12 },
            { productName: "产品C", sales: 2500.0, quantity: 15 },
          ],
        },
        timestamp: new Date(),
      };
    }
  }

  private async executeSalesQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeSalesOperation(operation);
  }

  private async executeSalesUpdate(operation: BusinessOperation): Promise<OperationResult> {
    return {
      success: true,
      message: "销售记录更新成功",
      data: {
        updatedFields: operation.parameters,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeFinanceOperation(operation: BusinessOperation): Promise<OperationResult> {
    const { parameters } = operation;

    if (parameters.reportType === "profit") {
      // 利润报表
      return {
        success: true,
        message: "财务报表查询成功",
        data: {
          reportType: "利润报表",
          dateRange: "2024年1月",
          totalRevenue: 500000.0,
          totalCost: 350000.0,
          grossProfit: 150000.0,
          netProfit: 120000.0,
          profitMargin: 24.0,
          breakdown: [
            { category: "销售收入", amount: 500000.0, percentage: 100.0 },
            { category: "商品成本", amount: -300000.0, percentage: -60.0 },
            { category: "运营费用", amount: -50000.0, percentage: -10.0 },
            { category: "净利润", amount: 120000.0, percentage: 24.0 },
          ],
        },
        timestamp: new Date(),
      };
    } else {
      // 综合财务概览
      return {
        success: true,
        message: "财务概览查询成功",
        data: {
          currentMonth: {
            revenue: 500000.0,
            expenses: 380000.0,
            profit: 120000.0,
          },
          previousMonth: {
            revenue: 450000.0,
            expenses: 340000.0,
            profit: 110000.0,
          },
          growth: {
            revenue: 11.1,
            profit: 9.1,
          },
          cashFlow: {
            current: 150000.0,
            projected: 180000.0,
          },
        },
        timestamp: new Date(),
      };
    }
  }

  private async executeFinanceQuery(operation: BusinessOperation): Promise<OperationResult> {
    return this.executeFinanceOperation(operation);
  }

  private async executeFinanceUpdate(operation: BusinessOperation): Promise<OperationResult> {
    return {
      success: true,
      message: "财务记录更新成功",
      data: {
        updatedFields: operation.parameters,
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  private async executeGeneralOperation(operation: BusinessOperation): Promise<OperationResult> {
    return {
      success: true,
      message: "通用操作执行成功",
      data: {
        operationType: operation.type,
        parameters: operation.parameters,
        executedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  // 添加自定义操作类型
  addOperation(
    type: string,
    executor: (operation: BusinessOperation) => Promise<OperationResult>,
  ): void {
    this.supportedOperations.set(type, executor);
  }

  // 移除操作类型
  removeOperation(type: string): boolean {
    return this.supportedOperations.delete(type);
  }

  // 获取支持的操作类型列表
  getSupportedOperations(): string[] {
    return Array.from(this.supportedOperations.keys());
  }
}
