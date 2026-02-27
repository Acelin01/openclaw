import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runVerification() {
  console.log("🚀 开始验证 MCP 服务输出能力...");

  // 1. 启动 MCP 服务器
  const serverPath = path.resolve(__dirname, "index.ts");
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", serverPath],
    env: { ...process.env, NODE_ENV: "development" }
  });

  const client = new Client(
    {
      name: "test-mcp-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("✅ 成功连接到 MCP 服务器");

    // 2. 验证工具列表获取 (List Tools)
    console.log("\n--- 验证工具注册 ---");
    const toolsResponse = await client.listTools();
    
    console.log(`发现工具数量: ${toolsResponse.tools.length}`);
    const toolNames = toolsResponse.tools.map(t => t.name);
    console.log("可用工具列表:", toolNames.join(", "));

    if (toolNames.includes("project_create") && toolNames.includes("talent_match")) {
      console.log("✅ 核心工具注册验证通过");
    } else {
      console.warn("⚠️ 部分预期工具未找到");
    }

    // 3. 验证项目协作工具调用 (Call Tool: project_create)
    console.log("\n--- 验证项目协作工具调用 ---");
    const projectResult = await client.callTool({
      name: "project_create",
      arguments: {
        name: "MCP 验证测试项目",
        owner_id: "user-123",
        description: "这是一个用于验证 MCP 输出能力的自动化测试项目"
      }
    });

    console.log("项目创建结果:", JSON.stringify(projectResult.content, null, 2));
    if (!projectResult.isError) {
      console.log("✅ 项目协作工具调用验证通过");
    }

    // 4. 验证自由职业者服务工具调用 (Call Tool: talent_match)
    console.log("\n--- 验证自由职业者服务工具调用 ---");
    const talentResult = await client.callTool({
      name: "talent_match",
      arguments: {
        skills: ["React", "Node.js"],
        budget: 5000
      }
    });

    console.log("人才匹配结果:", JSON.stringify(talentResult.content, null, 2));
    if (!talentResult.isError) {
      console.log("✅ 自由职业者服务工具调用验证通过");
    }

    console.log("\n✨ 所有 MCP 输出能力验证完成！");

  } catch (error) {
    console.error("❌ 验证过程中发生错误:", error);
  } finally {
    // 清理资源
    await transport.close();
    process.exit(0);
  }
}

runVerification().catch(console.error);
