import mysql from "mysql2/promise";
import { DatabaseConfig, DatabaseQuery, OperationResult } from "./types";

export class DatabaseConnector {
  private config: DatabaseConfig;
  private connection: mysql.Connection | mysql.Pool | null = null;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      if (this.config.type === "mysql") {
        this.connection = await mysql.createConnection({
          host: this.config.host,
          port: this.config.port,
          user: this.config.username,
          password: this.config.password,
          database: this.config.database,
          ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
        });
      } else if (this.config.type === "postgresql") {
        // PostgreSQL连接将在后续版本中实现
        throw new Error("PostgreSQL support coming soon");
      }

      this.isConnected = true;
      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Failed to connect to database:", error);
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.end();
        this.connection = null;
        this.isConnected = false;
        console.log("Database connection closed successfully");
      }
    } catch (error) {
      console.error("Error closing database connection:", error);
      throw error;
    }
  }

  async execute(query: DatabaseQuery): Promise<OperationResult> {
    if (!this.isConnected) {
      return {
        success: false,
        message: "数据库连接未建立",
        data: null,
        timestamp: new Date(),
        error: "Database not connected",
      };
    }

    try {
      let sql: string;
      let params: any[] = [];

      switch (query.type) {
        case "select":
          const selectResult = await this.executeSelect(query);
          return selectResult;

        case "insert":
          const insertResult = await this.executeInsert(query);
          return insertResult;

        case "update":
          const updateResult = await this.executeUpdate(query);
          return updateResult;

        case "delete":
          const deleteResult = await this.executeDelete(query);
          return deleteResult;

        default:
          return {
            success: false,
            message: `不支持的查询类型: ${query.type}`,
            data: null,
            timestamp: new Date(),
          };
      }
    } catch (error) {
      console.error("Database query execution failed:", error);

      return {
        success: false,
        message: "数据库查询执行失败",
        data: null,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeSelect(query: DatabaseQuery): Promise<OperationResult> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    let sql = `SELECT * FROM ${query.table}`;
    const params: any[] = [];
    const conditions: string[] = [];

    // 构建WHERE条件
    if (query.conditions && Object.keys(query.conditions).length > 0) {
      for (const [key, value] of Object.entries(query.conditions)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
      }
    }

    // 添加ORDER BY
    if (query.orderBy) {
      sql += ` ORDER BY ${query.orderBy}`;
      if (query.orderDirection) {
        sql += ` ${query.orderDirection}`;
      }
    }

    // 添加LIMIT
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
      if (query.offset) {
        sql += ` OFFSET ${query.offset}`;
      }
    }

    try {
      const [rows] = await this.connection.execute(sql, params);

      return {
        success: true,
        message: `成功查询到 ${Array.isArray(rows) ? rows.length : 0} 条记录`,
        data: rows,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`SELECT query failed: ${error}`);
    }
  }

  private async executeInsert(query: DatabaseQuery): Promise<OperationResult> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    if (!query.data || Object.keys(query.data).length === 0) {
      return {
        success: false,
        message: "没有提供要插入的数据",
        data: null,
        timestamp: new Date(),
      };
    }

    const columns = Object.keys(query.data);
    const values = Object.values(query.data);
    const placeholders = columns.map(() => "?").join(", ");

    const sql = `INSERT INTO ${query.table} (${columns.join(", ")}) VALUES (${placeholders})`;

    try {
      const [result] = await this.connection.execute(sql, values);

      return {
        success: true,
        message: "数据插入成功",
        data: {
          insertId: (result as any).insertId,
          affectedRows: (result as any).affectedRows,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`INSERT query failed: ${error}`);
    }
  }

  private async executeUpdate(query: DatabaseQuery): Promise<OperationResult> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    if (!query.data || Object.keys(query.data).length === 0) {
      return {
        success: false,
        message: "没有提供要更新的数据",
        data: null,
        timestamp: new Date(),
      };
    }

    if (!query.conditions || Object.keys(query.conditions).length === 0) {
      return {
        success: false,
        message: "更新操作必须提供WHERE条件",
        data: null,
        timestamp: new Date(),
      };
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    // 构建SET子句
    for (const [key, value] of Object.entries(query.data)) {
      if (value !== undefined && value !== null) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    // 构建WHERE条件
    const whereClauses: string[] = [];
    for (const [key, value] of Object.entries(query.conditions)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    const sql = `UPDATE ${query.table} SET ${setClauses.join(", ")} WHERE ${whereClauses.join(" AND ")}`;

    try {
      const [result] = await this.connection.execute(sql, params);

      return {
        success: true,
        message: "数据更新成功",
        data: {
          affectedRows: (result as any).affectedRows,
          changedRows: (result as any).changedRows,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`UPDATE query failed: ${error}`);
    }
  }

  private async executeDelete(query: DatabaseQuery): Promise<OperationResult> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    if (!query.conditions || Object.keys(query.conditions).length === 0) {
      return {
        success: false,
        message: "删除操作必须提供WHERE条件",
        data: null,
        timestamp: new Date(),
      };
    }

    const whereClauses: string[] = [];
    const params: any[] = [];

    // 构建WHERE条件
    for (const [key, value] of Object.entries(query.conditions)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    const sql = `DELETE FROM ${query.table} WHERE ${whereClauses.join(" AND ")}`;

    try {
      const [result] = await this.connection.execute(sql, params);

      return {
        success: true,
        message: "数据删除成功",
        data: {
          affectedRows: (result as any).affectedRows,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`DELETE query failed: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.connection) {
        return false;
      }

      await this.connection.execute("SELECT 1");
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}
