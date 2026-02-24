#!/usr/bin/env node

/**
 * 微信小程序对接OpenClaw - 快速启动脚本
 * 用于测试项目基本功能
 */

import { readFileSync, existsSync, statSync, readdirSync, copyFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

console.log("=== 微信小程序对接OpenClaw - 快速启动测试 ===\n");

// 检查Node.js版本
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.replace("v", "").split(".")[0]);

if (nodeMajor < 18) {
  console.error(`错误: 需要Node.js 18或更高版本，当前版本: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✓ Node.js版本: ${nodeVersion}`);

// 检查TypeScript文件是否存在
const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "src/wechat-mini/client.ts",
  "src/wechat-mini/server.ts",
  "src/wechat-mini/types.ts",
];

console.log("\n检查项目文件...");
let allFilesExist = true;

requiredFiles.forEach((file) => {
  const filePath = join(__dirname, file);
  if (existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} (缺失)`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error("\n错误: 缺少必要的项目文件");
  process.exit(1);
}

console.log("\n✓ 所有必要文件都存在");

// 读取package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
console.log(`\n项目信息:`);
console.log(`  名称: ${packageJson.name}`);
console.log(`  版本: ${packageJson.version}`);
console.log(`  描述: ${packageJson.description}`);

// 检查依赖
console.log("\n检查依赖...");
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log(`  生产依赖: ${dependencies.length} 个`);
console.log(`  开发依赖: ${devDependencies.length} 个`);

// 检查node_modules
const nodeModulesPath = join(__dirname, "node_modules");
if (existsSync(nodeModulesPath)) {
  console.log("✓ node_modules目录存在");
} else {
  console.log("⚠ node_modules目录不存在，需要运行 npm install");
}

// 检查环境变量
console.log("\n检查环境变量...");
const envPath = join(__dirname, ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf8");
  const hasAppId = envContent.includes("WECHAT_APP_ID") && !envContent.includes("your_app_id_here");
  const hasAppSecret =
    envContent.includes("WECHAT_APP_SECRET") && !envContent.includes("your_app_secret_here");

  console.log(`  .env文件: 存在`);
  console.log(`  AppID配置: ${hasAppId ? "已设置" : "需要设置"}`);
  console.log(`  AppSecret配置: ${hasAppSecret ? "已设置" : "需要设置"}`);

  if (!hasAppId || !hasAppSecret) {
    console.log("\n⚠ 警告: 请编辑 .env 文件，填写实际的微信小程序配置");
    console.log("  1. 获取微信小程序 AppID 和 AppSecret");
    console.log("  2. 编辑 .env 文件");
    console.log("  3. 设置 WECHAT_APP_ID 和 WECHAT_APP_SECRET");
  }
} else {
  const envExamplePath = join(__dirname, ".env.example");
  if (existsSync(envExamplePath)) {
    console.log("⚠ .env文件不存在，已从 .env.example 创建");
    copyFileSync(envExamplePath, envPath);
  } else {
    console.log("⚠ .env文件不存在，也没有 .env.example 文件");
  }
}

// 显示可用命令
console.log("\n=== 可用命令 ===");
console.log("npm install      - 安装依赖");
console.log("npm run build    - 构建TypeScript");
console.log("npm run dev      - 开发模式（热重载）");
console.log("npm start        - 生产模式");
console.log("npm test         - 运行测试");
console.log("./start.sh       - 使用启动脚本");
console.log("");

// 显示项目结构
console.log("=== 项目结构 ===");
function listDir(dir, prefix = "") {
  const items = readdirSync(dir);
  items.forEach((item, index) => {
    const itemPath = join(dir, item);
    const isLast = index === items.length - 1;
    const connector = isLast ? "└── " : "├── ";

    console.log(prefix + connector + item);

    if (
      statSync(itemPath).isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules" &&
      item !== "dist"
    ) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      listDir(itemPath, newPrefix);
    }
  });
}

try {
  listDir(__dirname);
} catch {
  console.log("(无法显示完整目录结构)");
}

console.log("\n=== 下一步 ===");
console.log("1. 编辑 .env 文件，填写微信小程序配置");
console.log("2. 运行: npm install");
console.log("3. 运行: npm run build");
console.log("4. 运行: npm run dev 或 ./start.sh");
console.log("\n项目已准备就绪！ 🚀");
