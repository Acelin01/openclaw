# 🚀 FRP 客户端安装指南

**Last Updated**: 2026-03-02  
**Version**: 1.0.0

---

## 📋 系统要求

- **操作系统**: macOS (Intel/Apple Silicon)
- **权限**: sudo 权限
- **网络**: 可访问 GitHub

---

## 🔧 安装方法

### 方法 1: 使用 Homebrew (推荐)

**优点**: 自动管理，易于更新

```bash
# 1. 安装 frp
brew install frp

# 2. 验证安装
frpc --version

# 3. 查看配置文件位置
# Apple Silicon: /opt/homebrew/etc/frp/
# Intel: /usr/local/etc/frp/

# 4. 启动服务
brew services start frp

# 5. 检查服务状态
brew services list | grep frp
```

---

### 方法 2: 使用安装脚本 (自动化)

**优点**: 一键安装，自动配置

```bash
# 1. 下载并运行安装脚本
cd /Users/acelin/Documents/Next/AIGC/openclaw
./install-frp.sh

# 2. 验证安装
frpc --version

# 3. 配置 frpc.ini
sudo vi /usr/local/etc/frp/frpc.ini

# 4. 启动服务
sudo frpc -c /usr/local/etc/frp/frpc.ini
```

---

### 方法 3: 手动安装

**优点**: 完全控制，可选择版本

```bash
# 1. 下载最新版本
cd /tmp
curl -LO https://github.com/fatedier/frp/releases/download/v0.52.0/frp_0.52.0_darwin_arm64.tar.gz

# Apple Silicon 使用 arm64
# Intel 使用 amd64

# 2. 解压
tar -xzf frp_0.52.0_darwin_arm64.tar.gz
cd frp_0.52.0_darwin_arm64

# 3. 安装到系统路径
sudo mv frpc /usr/local/bin/
sudo chmod +x /usr/local/bin/frpc

# 4. 验证
frpc --version

# 5. 创建配置目录
sudo mkdir -p /usr/local/etc/frp
sudo mv frpc.ini /usr/local/etc/frp/

# 6. 启动
sudo frpc -c /usr/local/etc/frp/frpc.ini
```

---

## ⚙️ 配置指南

### 基本配置

编辑配置文件 `/usr/local/etc/frp/frpc.ini`:

```ini
[common]
# FRP 服务器地址
server_addr = your.server.com
# FRP 服务器端口
server_port = 7000
# 认证令牌
token = your_token

# SSH 穿透示例
[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000

# Web 服务穿透示例
[web]
type = http
local_port = 80
custom_domains = your.domain.com

# Chat-Lite 穿透示例
[chat-lite]
type = http
local_port = 3002
custom_domains = chat-lite.yourdomain.com
subdomain = chat-lite
```

### 配置说明

| 参数           | 说明           | 示例              |
| -------------- | -------------- | ----------------- |
| server_addr    | FRP 服务器地址 | frp.example.com   |
| server_port    | FRP 服务器端口 | 7000              |
| token          | 认证令牌       | your_secret_token |
| type           | 穿透类型       | tcp, http, https  |
| local_port     | 本地服务端口   | 3002              |
| remote_port    | 远程访问端口   | 6000              |
| custom_domains | 自定义域名     | app.example.com   |
| subdomain      | 子域名         | chat-lite         |

---

## 🏃 运行 FRP

### 手动启动

```bash
# 前台运行（调试用）
frpc -c /usr/local/etc/frp/frpc.ini

# 后台运行
nohup frpc -c /usr/local/etc/frp/frpc.ini > /tmp/frpc.log 2>&1 &

# 查看日志
tail -f /tmp/frpc.log
```

### 使用 Homebrew 服务

```bash
# 启动服务
brew services start frp

# 停止服务
brew services stop frp

# 重启服务
brew services restart frp

# 查看状态
brew services list | grep frp

# 查看日志
brew services logs frp
```

### 使用 systemd (Linux)

```bash
# 创建服务文件
sudo vi /etc/systemd/system/frpc.service

# 启动服务
sudo systemctl start frpc

# 设置开机自启
sudo systemctl enable frpc

# 查看状态
sudo systemctl status frpc
```

---

## 🧪 验证安装

### 验证脚本

```bash
# 运行验证脚本
./check-frp.sh
```

### 手动验证

```bash
# 1. 检查命令
frpc --version

# 2. 检查进程
ps aux | grep frpc

# 3. 检查配置文件
frpc verify -c /usr/local/etc/frp/frpc.ini

# 4. 检查连接
frpc -c /usr/local/etc/frp/frpc.ini

# 5. 检查端口
netstat -an | grep 7000
```

### 验证输出示例

```
╔════════════════════════════════════════════════════════╗
║     FRP 客户端验证检查                                ║
╚════════════════════════════════════════════════════════╝

✅ frpc 命令：已安装
frpc version v0.52.0

✅ frpc 进程：运行中 (PID: 12345)
acelin  12345  0.0  0.1  frpc -c /usr/local/etc/frp/frpc.ini

✅ 配置文件：/usr/local/etc/frp/frpc.ini 存在

✅ Homebrew 安装：已安装
frp: stable 0.52.0

═══════════════════════════════════════════════════════
验证完成 - FRP 客户端已正确安装
═══════════════════════════════════════════════════════
```

---

## 🐛 故障排查

### 问题 1: frpc 命令未找到

**解决**:

```bash
# 检查 PATH
echo $PATH

# 添加 frpc 到 PATH
export PATH="/usr/local/bin:$PATH"

# 或创建软链接
sudo ln -s /path/to/frpc /usr/local/bin/frpc
```

### 问题 2: 无法连接到服务器

**解决**:

```bash
# 检查服务器地址
cat /usr/local/etc/frp/frpc.ini | grep server_addr

# 测试连接
telnet your.server.com 7000

# 检查防火墙
sudo pfctl -s rules
```

### 问题 3: 配置文件错误

**解决**:

```bash
# 验证配置
frpc verify -c /usr/local/etc/frp/frpc.ini

# 检查语法
cat /usr/local/etc/frp/frpc.ini

# 查看示例配置
frpc --help
```

### 问题 4: 服务无法启动

**解决**:

```bash
# 查看日志
tail -f /tmp/frpc.log

# 检查端口占用
lsof -i :7000

# 重启服务
brew services restart frp
```

---

## 📊 安装检查清单

安装完成后确认：

- [ ] frpc 命令可用
- [ ] frpc --version 显示版本号
- [ ] 配置文件已创建 (/usr/local/etc/frp/frpc.ini)
- [ ] frpc 进程运行中
- [ ] 能够连接到 frp 服务器
- [ ] 隧道正常工作
- [ ] 日志无错误

---

## 🔗 相关资源

- **GitHub**: https://github.com/fatedier/frp
- **官方文档**: https://gofrp.org/docs/
- **Releases**: https://github.com/fatedier/frp/releases
- **Homebrew Formula**: https://formulae.brew.sh/formula/frp
- **配置示例**: https://github.com/fatedier/frp/blob/master/conf/frpc.ini

---

## 📖 配套文件

- `install-frp.sh` - FRP 自动安装脚本
- `check-frp.sh` - FRP 验证脚本
- `frpc.ini.example` - 配置文件示例

---

**Guide Version**: 1.0.0  
**Last Updated**: 2026-03-02  
**Status**: ✅ Ready for installation
