// 导入 Lit Web Components
import '../src/artifacts/viewer.js';
import '../src/artifacts/project-requirement/list-element.js';
import '../src/artifacts/requirement/list-element.js';

const statusEl = document.getElementById('status');
const viewer = document.getElementById('viewer');

// 获取认证 token
async function login() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@uxin.com', password: 'test123' })
    });
    const data = await response.json();
    if (data.success) {
      return data.data.token;
    }
    throw new Error('登录失败');
  } catch (error) {
    console.error('登录错误:', error);
    return null;
  }
}

// 获取需求列表
async function loadRequirements(token) {
  try {
    const response = await fetch('http://localhost:8000/api/v1/project-requirements?projectId=proj-uxin', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error('获取需求失败');
  } catch (error) {
    console.error('获取需求错误:', error);
    return null;
  }
}

// 主函数
async function init() {
  const token = await login();
  if (!token) {
    statusEl.textContent = '❌ 登录失败';
    statusEl.className = 'status error';
    return;
  }

  const requirements = await loadRequirements(token);
  if (!requirements) {
    statusEl.textContent = '❌ 加载失败';
    statusEl.className = 'status error';
    return;
  }

  // 设置 artifact 内容
  const artifactContent = {
    kind: 'project-requirement-list',
    data: {
      title: '全部需求',
      requirements: requirements.map(req => ({
        id: req.id,
        title: req.title,
        description: req.description,
        status: (req.status || 'PENDING').toLowerCase(),
        priority: (req.priority || 'MEDIUM').toLowerCase(),
        assignee: req.assigneeId,
        creator: req.reporterId,
        createdAt: new Date(req.createdAt).getTime()
      }))
    }
  };

  // 渲染 artifact
  viewer.content = artifactContent;

  statusEl.textContent = `✅ 成功加载 ${requirements.length} 条需求`;
  statusEl.className = 'status success';

  console.log('✅ Artifact 渲染成功:', artifactContent);
}

// 启动
init();
