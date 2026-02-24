---
title: "Chat Interface"
description: "Mobile-optimized chat interface for intelligent collaboration"
---

这是为您优化后的智能协作系统界面。它实现了移动端左侧历史对话抽屉、进度节点垂直排布、主题绿配色、智能体思考徽章以及附件/语音输入按钮，所有消息样式也已完整呈现。

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <!-- 移动端优化视口 -->
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <title>智能协作 · 全链路工作流｜移动双抽屉</title>
    <!-- 字体与图标库 -->
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <style>
      /* ---------- 全局设计变量 ---------- */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :root {
        --bg: #f0f4f8;
        --sidebar-bg: #ffffff;
        --chat-bg: #f5f8fa;
        --accent: #2c7be5;
        --accent-light: #eef4ff;
        --accent-border: #b6d0f7;
        --accent2: #4caf83; /* 主题绿 */
        --accent2-light: #e8f5ef;
        --accent2-border: #a8dfc4;
        --purple: #9c27b0;
        --purple-light: #f3e5f5;
        --orange: #f5a623;
        --orange-light: #fff8ec;
        --orange-border: #ffd580;
        --text-primary: #1a1f2e;
        --text-secondary: #6b7280;
        --text-muted: #9ca3af;
        --border: #e5e9f0;
        --shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
        --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
        --radius: 14px;
        --radius-sm: 8px;
        --progress-glow: rgba(44, 123, 229, 0.28);
      }

      body {
        font-family: "Noto Sans SC", sans-serif;
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
      }

      .app-shell {
        display: flex;
        width: 100%;
        max-width: 1200px;
        height: 90vh;
        min-height: 580px;
        background: var(--sidebar-bg);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        position: relative;
      }

      /* 聊天主面板 */
      .chat-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--chat-bg);
        min-width: 0;
        border-right: 1px solid var(--border);
      }

      /* ---------- 顶部栏：无头像，单行标题，支持项目/对话区分 ---------- */
      .top-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        background: var(--sidebar-bg);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }

      /* 返回/菜单按钮（桌面为返回，移动为汉堡） */
      .back-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--border);
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 14px;
        transition: background 0.15s;
        flex-shrink: 0;
        text-decoration: none;
      }
      .back-btn:hover {
        background: var(--bg);
      }

      /* 完全移除头像区域 */
      .agent-thumb {
        display: none;
      }

      /* 标题区：严格单行，区分项目/对话 */
      .agent-meta {
        flex: 1;
        min-width: 0;
      }
      .agent-meta h1 {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      /* 隐藏原副标题 */
      .agent-meta p {
        display: none;
      }

      .top-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      /* 右上角图标按钮（移动用作状态抽屉触发） */
      .icon-btn {
        height: 32px;
        min-width: 32px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        font-size: 14px;
        font-family: inherit;
        font-weight: 600;
        gap: 5px;
        padding: 0 10px;
        transition: all 0.15s;
      }
      .icon-btn:hover {
        background: var(--accent-light);
        border-color: var(--accent-border);
        color: var(--accent);
      }

      /* ---------- 进度区域（桌面保留优化版本，移动移除进度条+节点垂直） ---------- */
      .phase-bar {
        padding: 14px 20px;
        background: var(--sidebar-bg);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* 全局进度条 – 桌面保留，移动隐藏 */
      .global-progress-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .progress-meta span:first-child {
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: 0.3px;
      }
      .progress-meta strong {
        color: var(--accent);
        font-size: 15px;
        font-weight: 700;
        margin-left: 4px;
      }
      .progress-track {
        width: 100%;
        height: 8px;
        background: #e9ecf3;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #2c7be5, #6aa9ff);
        border-radius: 10px;
        position: relative;
        transition: width 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
        box-shadow: 0 0 8px var(--progress-glow);
      }
      .progress-fill::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0) 80%
        );
        animation: shimmer 2.2s infinite;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      /* 阶段步骤（默认横向，移动纵向且label在dot下方） */
      .phase-steps {
        display: flex;
        align-items: center;
        gap: 0;
        min-width: max-content;
        padding: 2px 0;
      }
      .phase-step {
        display: flex;
        align-items: center;
        gap: 6px;
        position: relative;
      }
      .phase-step:not(:last-child)::after {
        content: "";
        display: block;
        width: 32px;
        height: 3px;
        background: linear-gradient(90deg, #d0d7e2 0%, #bcc3ce 100%);
        margin: 0 6px;
        flex-shrink: 0;
        border-radius: 2px;
        transition:
          background 0.3s ease,
          box-shadow 0.2s;
      }
      .phase-step.completed:not(:last-child)::after {
        background: linear-gradient(90deg, var(--accent2), #73d3a0);
        box-shadow: 0 0 4px rgba(76, 175, 131, 0.5);
      }
      .phase-step.active:not(:last-child)::after {
        background: linear-gradient(90deg, var(--accent2), #93dfb0);
        box-shadow: 0 0 4px rgba(76, 175, 131, 0.3);
      }
      .phase-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e5e9f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--text-muted);
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      .phase-step.active .phase-dot {
        background: var(--accent2);
        color: #fff;
        transform: scale(1.12);
        box-shadow: 0 0 0 3px rgba(76, 175, 131, 0.25);
      }
      .phase-step.completed .phase-dot {
        background: #2e7d32;
        color: #fff;
        box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
      }
      .phase-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
        white-space: nowrap;
        transition:
          color 0.2s,
          font-weight 0.2s;
      }
      .phase-step.active .phase-label {
        color: var(--text-primary);
        font-weight: 700;
      }
      .phase-step.completed .phase-label {
        color: var(--text-secondary);
      }

      /* ---------- 消息区域 ---------- */
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 22px 24px 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .messages::-webkit-scrollbar {
        width: 4px;
      }
      .messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 2px;
      }

      /* 消息行：头像与气泡顶部对齐（消息内容与头像同行上对齐） */
      .bubble-row {
        display: flex;
        align-items: flex-start; /* 改为顶部对齐 */
        gap: 10px;
        animation: fadeUp 0.35s ease both;
        max-width: 82%;
      }
      .bubble-row.bot {
        justify-content: flex-start;
        align-self: flex-start;
      }
      .bubble-row.user {
        justify-content: flex-end;
        align-self: flex-end;
        flex-direction: row-reverse;
      }
      .bubble-row.sys {
        align-self: center;
        max-width: 100%;
        width: 100%;
        justify-content: center;
      }

      .bubble-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .bubble-avatar.av-sys {
        background: linear-gradient(135deg, #607d8b, #455a64);
      }
      .bubble-avatar.av-pm {
        background: linear-gradient(135deg, #3f51b5, #2196f3);
      }
      .bubble-avatar.av-pd {
        background: linear-gradient(135deg, #ff9800, #ff5722);
      }
      .bubble-avatar.av-tm {
        background: linear-gradient(135deg, #4caf50, #8bc34a);
      }
      .bubble-avatar.av-mk {
        background: linear-gradient(135deg, #9c27b0, #673ab7);
      }
      .bubble-avatar.av-ux {
        background: linear-gradient(135deg, #00bcd4, #009688);
      }
      .bubble-avatar.av-usr {
        background: linear-gradient(135deg, var(--accent2), #2e7d32);
      } /* 用户头像改为绿色系 */

      .bubble {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--text-primary);
      }
      /* 智能体气泡：白底灰边 */
      .bubble-row.bot .bubble {
        background: #fff;
        border-radius: 4px 16px 16px 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        max-width: calc(100% - 42px);
      }
      /* 用户气泡：主题绿 */
      .bubble-row.user .bubble {
        background: linear-gradient(135deg, var(--accent2), #2e7d32); /* 主题绿渐变 */
        color: #fff;
        border-radius: 16px 4px 16px 16px;
        box-shadow: 0 3px 12px rgba(76, 175, 131, 0.32);
        max-width: calc(100% - 42px);
      }
      .bubble-row.sys .bubble {
        background: #f0f4f8;
        color: var(--text-secondary);
        border-radius: 10px;
        font-size: 12.5px;
        padding: 8px 18px;
        text-align: center;
        border: 1px solid var(--border);
      }

      .msg-header {
        display: flex;
        flex-direction: column; /* 改为纵向，使思考标签在名称下方 */
        align-items: flex-start;
        margin-bottom: 7px;
        gap: 2px;
      }
      .msg-sender {
        font-weight: 700;
        font-size: 13px;
        color: var(--text-primary);
      }
      /* 思考样式：智能体消息专属徽章 */
      .think-badge {
        font-size: 10px;
        color: var(--text-muted);
        background: #f0f2f5;
        padding: 2px 8px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }
      .think-badge i {
        font-size: 10px;
      }
      .bubble-row.user .msg-sender {
        color: #fff;
      }
      .bubble-row.user .think-badge {
        display: none;
      } /* 用户消息不显示思考 */

      .msg-type {
        font-size: 10.5px;
        padding: 2px 7px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.06);
        color: var(--text-secondary);
        align-self: flex-start;
      }
      .bubble-row.user .msg-type {
        background: rgba(255, 255, 255, 0.22);
        color: rgba(255, 255, 255, 0.9);
      }

      .msg-time {
        font-size: 10.5px;
        opacity: 0.6;
        margin-top: 5px;
      }
      .bubble-row.user .msg-time {
        text-align: right;
      }

      /* 各类卡片样式保持不变 */
      .fbox {
        background: #e8f5e9;
        border: 1px solid #c8e6c9;
        border-radius: 8px;
        padding: 11px 13px;
        margin-top: 9px;
        font-size: 13px;
      }
      .fbox.warn {
        background: #ffebee;
        border-color: #ef9a9a;
      }
      .fbox-header {
        font-weight: 700;
        color: #2e7d32;
        margin-bottom: 7px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .suggestion {
        background: #f1f8e9;
        padding: 9px 11px;
        border-radius: 6px;
        margin-top: 9px;
        border-left: 3px solid #7cb342;
        font-size: 13px;
      }
      .tbox {
        background: #e3f2fd;
        border-radius: 8px;
        padding: 12px;
        margin-top: 10px;
      }
      .tbox-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #1565c0;
        font-weight: 700;
        font-size: 13px;
        margin-bottom: 9px;
      }
      .task-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 8px 10px;
        background: #fff;
        border-radius: 5px;
        margin-bottom: 7px;
        border-left: 3px solid #2196f3;
        font-size: 13px;
      }
      .tdot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #ddd;
        flex-shrink: 0;
      }
      .tdot.done {
        background: #4caf50;
      }
      .tdot.prog {
        background: #ffc107;
        animation: blink 1.5s infinite;
      }
      .tdot.pend {
        background: #9e9e9e;
      }
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.45;
        }
      }
      .task-name {
        font-weight: 500;
      }
      .task-det {
        font-size: 11.5px;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .msg-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
      }
      .act-btn {
        padding: 5px 12px;
        border-radius: 14px;
        font-size: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.25s;
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: inherit;
      }
      .act-primary {
        background: var(--accent);
        color: #fff;
      }
      .act-primary:hover {
        background: #1a6dd4;
      }
      .act-secondary {
        background: #f0f4f8;
        color: var(--text-primary);
        border: 1px solid var(--border);
      }
      .act-secondary:hover {
        background: #e5e9f0;
      }

      /* ---------- 输入框模块：增加附件、语言图标，发送按钮主题绿 ---------- */
      .input-area {
        padding: 12px 18px 16px;
        background: var(--sidebar-bg);
        border-top: 1px solid var(--border);
        flex-shrink: 0;
      }
      .input-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--chat-bg);
        border: 1.5px solid var(--border);
        border-radius: 50px;
        padding: 9px 9px 9px 18px;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }
      .input-row:focus-within {
        border-color: var(--accent2);
        box-shadow: 0 0 0 3px rgba(76, 175, 131, 0.1);
      }
      .chat-input {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        color: var(--text-primary);
        resize: none;
        min-height: 22px;
        max-height: 110px;
        line-height: 1.5;
      }
      .chat-input::placeholder {
        color: var(--text-muted);
      }

      /* 附件、语音按钮 */
      .attach-btn,
      .voice-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 16px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .attach-btn:hover,
      .voice-btn:hover {
        background: rgba(0, 0, 0, 0.04);
        color: var(--accent2);
      }

      /* 发送按钮 – 主题绿 */
      .send-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent2), #2e7d32);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 14px;
        flex-shrink: 0;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        box-shadow: 0 3px 10px rgba(76, 175, 131, 0.35);
      }
      .send-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 14px rgba(76, 175, 131, 0.5);
      }

      /* ---------- 右侧边栏（状态面板）桌面保留，移动抽屉从右向左 ---------- */
      .sidebar {
        width: 292px;
        flex-shrink: 0;
        background: var(--sidebar-bg);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 1px solid var(--border);
      }
      /* 右侧边栏内部样式（完整保留） */
      .sidebar-topbar {
        padding: 14px 18px 12px;
        border-bottom: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 9px;
        flex-shrink: 0;
      }
      .sidebar-topbar-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .toggle-label {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 13px;
        color: var(--text-primary);
        font-weight: 500;
      }
      .toggle-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        animation: blink 2s infinite;
      }
      .toggle-dot.green {
        background: #4caf50;
      }
      .toggle-dot.purple {
        background: #9c27b0;
        animation-delay: 0.5s;
      }
      .switch {
        position: relative;
        width: 36px;
        height: 20px;
        flex-shrink: 0;
      }
      .switch input {
        display: none;
      }
      .slider {
        position: absolute;
        inset: 0;
        background: #d1d5db;
        border-radius: 20px;
        cursor: pointer;
        transition: background 0.25s;
      }
      .slider::before {
        content: "";
        position: absolute;
        left: 3px;
        top: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.25s;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
      }
      .switch input:checked + .slider {
        background: var(--accent2);
      }
      .switch input:checked + .slider::before {
        transform: translateX(16px);
      }
      .switch.purple input:checked + .slider {
        background: var(--purple);
      }
      .sidebar-body {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      .s-section {
        padding: 16px 18px 0;
        margin-bottom: 4px;
      }
      .s-section-title {
        font-size: 11.5px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .count-badge {
        font-size: 11px;
        background: var(--accent-light);
        color: var(--accent);
        border: 1px solid var(--accent-border);
        padding: 1px 7px;
        border-radius: 10px;
      }
      .divider {
        height: 1px;
        background: var(--border);
        margin: 0 18px;
      }
      .agent-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .agent-item {
        display: flex;
        align-items: center;
        padding: 9px 10px;
        border-radius: 9px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1.5px solid transparent;
      }
      .agent-item:hover {
        background: var(--accent-light);
        border-color: var(--accent-border);
      }
      .agent-item.active {
        background: var(--accent-light);
        border-color: var(--accent);
      }
      .agent-av {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-weight: 700;
        font-size: 10px;
        color: white;
        flex-shrink: 0;
      }
      .ag-pm {
        background: linear-gradient(135deg, #3f51b5, #2196f3);
      }
      .ag-pd {
        background: linear-gradient(135deg, #ff9800, #ff5722);
      }
      .ag-tm {
        background: linear-gradient(135deg, #4caf50, #8bc34a);
      }
      .ag-mk {
        background: linear-gradient(135deg, #9c27b0, #673ab7);
      }
      .ag-ux {
        background: linear-gradient(135deg, #00bcd4, #009688);
      }
      .ag-sys {
        background: linear-gradient(135deg, #607d8b, #455a64);
      }
      .agent-info h4 {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .agent-info p {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 1px;
      }
      .agent-online {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4caf50;
        margin-left: auto;
        animation: blink 2.5s infinite;
      }
      .progress-stack {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .prog-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .prog-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .prog-bar {
        height: 6px;
        background: #e5e9f0;
        border-radius: 4px;
        overflow: hidden;
      }
      .prog-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 1.5s ease;
      }
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 9px 11px;
        border-radius: 7px;
        font-size: 12.5px;
        line-height: 1.5;
        color: var(--text-secondary);
      }
      .activity-item.amber {
        background: #fff8ec;
        border-left: 3px solid var(--orange);
      }
      .activity-item.green {
        background: var(--accent2-light);
        border-left: 3px solid var(--accent2);
      }
      .activity-item.blue {
        background: var(--accent-light);
        border-left: 3px solid var(--accent);
      }
      .activity-item i {
        margin-top: 1px;
        flex-shrink: 0;
      }

      /* ---------- 左侧历史对话面板（移动抽屉，从左向右） ---------- */
      .history-drawer {
        width: 280px;
        max-width: 85%;
        background: var(--sidebar-bg);
        border-right: 1px solid var(--border);
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1060;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 2px 0 16px rgba(0, 0, 0, 0.1);
      }
      .history-drawer.active {
        transform: translateX(0);
      }
      .history-header {
        padding: 18px 20px;
        border-bottom: 1px solid var(--border);
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .history-header i {
        color: var(--accent2);
        font-size: 18px;
      }
      .history-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        margin-bottom: 8px;
        background: var(--chat-bg);
        border: 1px solid transparent;
        transition: all 0.2s;
      }
      .history-item.active {
        background: var(--accent2-light);
        border-color: var(--accent2);
      }
      .history-item i {
        color: var(--accent2);
        font-size: 14px;
      }
      .history-info {
        flex: 1;
      }
      .history-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .history-time {
        font-size: 11px;
        color: var(--text-muted);
      }

      /* ---------- 移动样式 (max-width: 760px) ---------- */
      @media (max-width: 760px) {
        /* 1. 右侧状态面板变为抽屉 */
        .sidebar {
          display: flex !important;
          position: fixed;
          top: 0;
          right: 0;
          width: 280px;
          max-width: 85%;
          height: 100vh;
          border-left: 1px solid var(--border);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 1050;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
          border-radius: 0;
        }
        .sidebar.active {
          transform: translateX(0);
        }

        /* 2. 遮罩层共用 */
        .drawer-mask {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(2px);
          z-index: 1040;
          display: none;
        }
        .drawer-mask.active {
          display: block;
        }

        /* 3. 左侧返回按钮改为汉堡菜单（通过JS修改图标） */
        .back-btn i {
          font-size: 16px;
        } /* 方便动态设置 */

        /* 4. 移除全局进度条行 */
        .global-progress-container {
          display: none;
        }

        /* 5. 进度节点改为纵向：label放在dot下方 */
        .phase-steps {
          display: flex;
          flex-direction: row; /* 保持水平排列，但每个节点内部flex column */
          justify-content: space-between;
          width: 100%;
          min-width: auto;
          gap: 4px;
        }
        .phase-step {
          flex-direction: column; /* 图标在上，文字在下 */
          gap: 4px;
          flex: 1;
          text-align: center;
        }
        .phase-step:not(:last-child)::after {
          display: none; /* 移除连接线，移动下不美观 */
        }
        .phase-dot {
          width: 32px;
          height: 32px;
        }
        .phase-label {
          white-space: normal;
          word-break: break-word;
          font-size: 10px;
          line-height: 1.2;
        }

        /* 6. 调整消息宽度 */
        .bubble-row {
          max-width: 90%;
        }
      }

      /* 动画 */
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .typing-dots {
        display: inline-flex;
        gap: 4px;
        padding: 2px 0;
      }
      .typing-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #b0b8c8;
        animation: typingBounce 1.2s infinite ease-in-out;
      }
      .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes typingBounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-5px);
        }
      }

      /* 桌面遮罩默认隐藏 */
      .drawer-mask {
        display: none;
      }
      .history-drawer {
        display: none;
      } /* 默认隐藏，移动下通过media显示 */
      @media (max-width: 760px) {
        .history-drawer {
          display: flex;
        }
      }
    </style>
  </head>
  <body>
    <div class="app-shell">
      <!-- 左侧：历史对话抽屉（移动显示，桌面隐藏） -->
      <div class="history-drawer" id="historyDrawer">
        <div class="history-header">
          <i class="fas fa-comments"></i>
          <span>历史对话</span>
        </div>
        <div class="history-list">
          <div class="history-item active">
            <i class="fas fa-message"></i>
            <div class="history-info">
              <div class="history-title">客户数据仪表板 · 全链路</div>
              <div class="history-time">10:25 AM</div>
            </div>
          </div>
          <div class="history-item">
            <i class="fas fa-message"></i>
            <div class="history-info">
              <div class="history-title">用户画像系统设计评审</div>
              <div class="history-time">昨天</div>
            </div>
          </div>
          <div class="history-item">
            <i class="fas fa-message"></i>
            <div class="history-info">
              <div class="history-title">AI客服工作流优化</div>
              <div class="history-time">3月2日</div>
            </div>
          </div>
          <div class="history-item">
            <i class="fas fa-message"></i>
            <div class="history-info">
              <div class="history-title">数据中台需求评审</div>
              <div class="history-time">2月28日</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 遮罩层（同时控制左右抽屉） -->
      <div class="drawer-mask" id="drawerMask"></div>

      <!-- 聊天主面板 -->
      <div class="chat-panel">
        <!-- 顶部栏：无头像，单行项目/对话标题，移动返回变汉堡 -->
        <div class="top-bar">
          <button class="back-btn" id="historyToggleBtn" title="菜单">
            <!-- 桌面显示返回箭头，移动通过js改为汉堡，初始桌面版本 -->
            <i class="fas fa-arrow-left" id="backIcon"></i>
          </button>
          <div class="agent-meta">
            <!-- 区分：项目/对话标题，此处显示项目名称 -->
            <h1>客户数据仪表板 · 全链路工作流</h1>
          </div>
          <div class="top-actions">
            <button class="icon-btn" id="drawerToggleBtn" title="状态面板">
              <!-- 桌面分享图标，移动通过js改为bars -->
              <i class="fas fa-share-alt" id="statusIcon"></i>
            </button>
          </div>
        </div>

        <!-- 进度区域（移动会隐藏进度条，节点变纵向） -->
        <div class="phase-bar">
          <!-- 全局进度条 - 移动时通过CSS隐藏 -->
          <div class="global-progress-container">
            <div class="progress-meta">
              <span
                ><i
                  class="fas fa-flag-checkered"
                  style="margin-right: 6px; color: var(--accent);"
                ></i
                >全流程进度</span
              >
              <span><strong id="topOverallPercent">45%</strong> · 阶段: 任务分解</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" id="topProgressFill" style="width: 45%;"></div>
            </div>
          </div>
          <div class="phase-steps">
            <div class="phase-step completed">
              <div class="phase-dot"><i class="fas fa-check" style="font-size:10px"></i></div>
              <span class="phase-label">需求预检查</span>
            </div>
            <div class="phase-step completed">
              <div class="phase-dot"><i class="fas fa-check" style="font-size:10px"></i></div>
              <span class="phase-label">智能体分析</span>
            </div>
            <div class="phase-step completed">
              <div class="phase-dot"><i class="fas fa-check" style="font-size:10px"></i></div>
              <span class="phase-label">反馈处理</span>
            </div>
            <div class="phase-step active">
              <div class="phase-dot"><i class="fas fa-tasks" style="font-size:10px"></i></div>
              <span class="phase-label">任务分解</span>
            </div>
            <div class="phase-step">
              <div class="phase-dot"><i class="fas fa-play" style="font-size:8px"></i></div>
              <span class="phase-label">执行监控</span>
            </div>
            <div class="phase-step">
              <div class="phase-dot"><i class="fas fa-brain" style="font-size:10px"></i></div>
              <span class="phase-label">自演化</span>
            </div>
          </div>
        </div>

        <!-- 消息列表：所有消息完整展现，用户气泡主题绿，智能体增加思考徽章 -->
        <div class="messages" id="messages">
          <div class="welcome-card">
            <div class="welcome-avatar">🤖</div>
            <div class="welcome-name">智能协作系统</div>
          </div>
          <div class="bubble-row sys">
            <div class="bubble">
              <i class="fas fa-robot"></i>
              欢迎使用智能协作系统！系统已启动，全链路工作流就绪。请输入您的需求开始。
            </div>
          </div>
          <!-- 用户消息 主题绿-->
          <div class="bubble-row user">
            <div class="bubble-avatar av-usr">用户</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">产品经理（用户）</span>
                <span class="msg-type">需求提出</span>
              </div>
              我们需要开发一个新的客户数据仪表板，要求包括：<br />1. 实时数据可视化<br />2.
              多维度分析功能<br />3. 支持移动端访问<br />4. 数据导出功能<br />希望能在3个月内上线。
              <div class="msg-time">10:25 AM</div>
            </div>
          </div>
          <div class="bubble-row sys">
            <div class="bubble">
              <i class="fas fa-sync-alt"></i> 系统收到需求，启动预检查流程...
            </div>
          </div>
          <!-- 智能体消息：SYS 预检查（带思考徽章） -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-sys">SYS</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">系统协调器</span>
                <span class="think-badge"><i class="fas fa-brain"></i> 深度思考中</span>
                <span class="msg-type">预检查结果</span>
              </div>
              预检查已完成，结果如下：
              <div class="fbox">
                <div class="fbox-header"><i class="fas fa-check-circle"></i> 检查通过项</div>
                <ul>
                  <li>项目定义符合规范 ✓</li>
                  <li>需求描述完整度 85% ✓</li>
                </ul>
              </div>
              <div class="fbox warn">
                <div class="fbox-header">
                  <i class="fas fa-exclamation-triangle"></i> 需要补充项
                </div>
                检测到以下缺失项，系统将自动创建：
                <ul>
                  <li>项目基础设施（自动创建中...）</li>
                  <li>市场调研计划（自动生成中...）</li>
                  <li>迭代里程碑规划（自动生成中...）</li>
                </ul>
              </div>
              <div class="msg-time">10:26 AM</div>
            </div>
          </div>
          <div class="bubble-row sys">
            <div class="bubble">
              <i class="fas fa-bolt"></i>
              预检查通过！系统自动创建了缺失的项目基础设施。现在分发需求给专业智能体进行分析...
            </div>
          </div>
          <!-- PM 需求分发 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-pm">PM</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">项目经理智能体</span>
                <span class="think-badge"><i class="fas fa-cogs"></i> 任务规划中</span>
                <span class="msg-type">需求分发</span>
              </div>
              我已将需求分发给相关专业智能体进行分析：
              <ul style="margin-left:16px;margin-top:7px;">
                <li><strong>产品经理智能体</strong> — 需求合理性分析</li>
                <li><strong>技术经理智能体</strong> — 技术可行性评估</li>
                <li><strong>市场分析智能体</strong> — 市场价值评估</li>
                <li><strong>用户体验智能体</strong> — 交互体验评估</li>
              </ul>
              预计分析完成时间：2分钟
              <div class="msg-time">10:27 AM</div>
            </div>
          </div>
          <!-- PD 产品分析 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-pd">PD</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">产品经理智能体</span>
                <span class="think-badge"><i class="fas fa-lightbulb"></i> 创意生成</span>
                <span class="msg-type">分析完成</span>
              </div>
              产品分析完成。需求整体合理，但有以下建议：
              <div class="suggestion">
                <strong>建议调整：</strong
                >考虑到用户使用场景，建议增加"数据预警"功能，当关键指标异常时自动通知用户。这将提升产品价值30%。
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary"><i class="fas fa-check"></i> 接受建议</button>
                <button class="act-btn act-secondary"><i class="fas fa-times"></i> 拒绝建议</button>
              </div>
              <div class="msg-time">10:28 AM</div>
            </div>
          </div>
          <!-- TM 技术分析 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-tm">TM</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">技术经理智能体</span>
                <span class="think-badge"><i class="fas fa-microchip"></i> 架构推演</span>
                <span class="msg-type">分析完成</span>
              </div>
              技术可行性分析完成。3个月时间紧张，但通过以下调整可以实现：
              <div class="suggestion">
                <strong>技术建议：</strong
                >建议使用现成的数据可视化库（如ECharts）而不是从头开发，可节省40%开发时间。移动端访问建议采用响应式设计而非独立开发。
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary"><i class="fas fa-check"></i> 接受建议</button>
                <button class="act-btn act-secondary"><i class="fas fa-times"></i> 拒绝建议</button>
              </div>
              <div class="msg-time">10:29 AM</div>
            </div>
          </div>
          <!-- MK 市场分析 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-mk">MK</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">市场分析智能体</span>
                <span class="think-badge"><i class="fas fa-chart-line"></i> 竞品分析</span>
                <span class="msg-type">分析完成</span>
              </div>
              市场分析完成。基于竞品研究和趋势预测：
              <div class="suggestion">
                <strong>市场建议：</strong
                >当前市场对AI驱动的洞察功能需求增长120%。建议增加"智能趋势预测"模块，这将使产品竞争力提升50%。
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary"><i class="fas fa-check"></i> 接受建议</button>
                <button class="act-btn act-secondary"><i class="fas fa-times"></i> 拒绝建议</button>
              </div>
              <div class="msg-time">10:30 AM</div>
            </div>
          </div>
          <!-- UX 用户体验 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-ux">UX</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">用户体验智能体</span>
                <span class="think-badge"><i class="fas fa-paint-brush"></i> 体验评估</span>
                <span class="msg-type">分析完成</span>
              </div>
              用户体验分析完成。通过用户行为模式分析：
              <div class="suggestion">
                <strong>体验建议：</strong
                >用户研究显示，数据仪表板使用高峰在周一上午和周五下午。建议优化加载速度，并添加"收藏视图"功能。
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary"><i class="fas fa-check"></i> 接受建议</button>
                <button class="act-btn act-secondary"><i class="fas fa-times"></i> 拒绝建议</button>
              </div>
              <div class="msg-time">10:31 AM</div>
            </div>
          </div>
          <div class="bubble-row sys">
            <div class="bubble">
              <i class="fas fa-cogs"></i> 所有智能体分析完成！检测到4条优化建议，正在整合...
            </div>
          </div>
          <!-- PM 反馈整合 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-pm">PM</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">项目经理智能体</span>
                <span class="think-badge"><i class="fas fa-tasks"></i> 整合中</span>
                <span class="msg-type">反馈整合</span>
              </div>
              已整合所有智能体反馈，生成优化后的需求方案：
              <div class="tbox">
                <div class="tbox-header">
                  <span><i class="fas fa-clipboard-list"></i> 优化后需求</span>
                </div>
                <ul style="margin-left:16px;margin-top:6px;font-size:13px;">
                  <li>
                    <strong>核心功能</strong>：实时可视化 + 多维分析 + 响应式移动端 + 数据导出
                  </li>
                  <li><strong>增强功能</strong>：数据预警 + 智能趋势预测 + 收藏视图</li>
                  <li><strong>技术方案</strong>：ECharts库 + 响应式框架</li>
                  <li><strong>时间计划</strong>：3个月（技术方案优化确保可行性）</li>
                </ul>
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary" id="approveBtn">
                  <i class="fas fa-thumbs-up"></i> 批准需求
                </button>
                <button class="act-btn act-secondary"><i class="fas fa-edit"></i> 手动调整</button>
              </div>
              <div class="msg-time">10:32 AM</div>
            </div>
          </div>
          <div class="bubble-row sys">
            <div class="bubble">
              <i class="fas fa-tasks"></i>
              需求已批准！进入任务分解阶段。技术经理智能体正在分解任务...
            </div>
          </div>
          <!-- TM 任务分解 -->
          <div class="bubble-row bot">
            <div class="bubble-avatar av-tm">TM</div>
            <div class="bubble">
              <div class="msg-header">
                <span class="msg-sender">技术经理智能体</span>
                <span class="think-badge"><i class="fas fa-code-branch"></i> 任务分解</span>
                <span class="msg-type">任务分解完成</span>
              </div>
              任务分解完成。基于需求复杂度，已将项目分解为3个迭代，共42个任务：
              <div class="tbox">
                <div class="tbox-header">
                  <span><i class="fas fa-project-diagram"></i> 项目任务分解</span>
                  <span>共42任务</span>
                </div>
                <div class="task-item">
                  <div class="tdot prog"></div>
                  <div>
                    <div class="task-name">迭代1：基础架构与数据接入</div>
                    <div class="task-det">12个任务 · 4周 · 开发团队A</div>
                  </div>
                </div>
                <div class="task-item">
                  <div class="tdot pend"></div>
                  <div>
                    <div class="task-name">迭代2：核心可视化功能</div>
                    <div class="task-det">18个任务 · 5周 · 开发团队B</div>
                  </div>
                </div>
                <div class="task-item">
                  <div class="tdot pend"></div>
                  <div>
                    <div class="task-name">迭代3：增强功能与优化</div>
                    <div class="task-det">12个任务 · 3周 · 开发团队A+B</div>
                  </div>
                </div>
              </div>
              <div class="msg-actions">
                <button class="act-btn act-primary" id="startExecBtn">
                  <i class="fas fa-play"></i> 开始执行
                </button>
                <button class="act-btn act-secondary">
                  <i class="fas fa-adjust"></i> 调整分解
                </button>
              </div>
              <div class="msg-time">10:35 AM</div>
            </div>
          </div>
          <div id="newMessages"></div>
        </div>

        <!-- 输入区：增加附件、语音按钮，发送按钮主题绿 -->
        <div class="input-area">
          <div class="input-row">
            <button class="attach-btn" title="附件"><i class="fas fa-paperclip"></i></button>
            <textarea
              id="chatInput"
              class="chat-input"
              placeholder="输入您的消息或指令..."
              rows="1"
            ></textarea>
            <button class="voice-btn" title="语音输入"><i class="fas fa-microphone"></i></button>
            <button class="send-btn" id="sendBtn" title="发送">
              <i class="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧状态面板（移动抽屉） -->
      <div class="sidebar" id="mobileDrawer">
        <div class="sidebar-topbar">
          <div class="sidebar-topbar-title">系统状态</div>
          <div class="toggle-row">
            <label class="toggle-label"><span class="toggle-dot green"></span>系统运行中</label
            ><label class="switch"
              ><input type="checkbox" checked id="sysToggle" /><span class="slider"></span
            ></label>
          </div>
          <div class="toggle-row">
            <label class="toggle-label"><span class="toggle-dot purple"></span>自演化已开启</label
            ><label class="switch purple"
              ><input type="checkbox" checked id="evoToggle" /><span class="slider"></span
            ></label>
          </div>
        </div>
        <div class="sidebar-body">
          <div class="s-section">
            <div class="s-section-title">
              智能体状态<span class="count-badge" id="onlineCount">6 在线</span>
            </div>
            <ul class="agent-list">
              <li class="agent-item active">
                <div class="agent-av ag-pm">PM</div>
                <div class="agent-info">
                  <h4>项目经理</h4>
                  <p>工作中</p>
                </div>
                <div class="agent-online"></div>
              </li>
              <li class="agent-item">
                <div class="agent-av ag-pd">PD</div>
                <div class="agent-info">
                  <h4>产品经理</h4>
                  <p>分析需求</p>
                </div>
                <div class="agent-online"></div>
              </li>
              <li class="agent-item">
                <div class="agent-av ag-tm">TM</div>
                <div class="agent-info">
                  <h4>技术经理</h4>
                  <p>评估可行性</p>
                </div>
                <div class="agent-online"></div>
              </li>
              <li class="agent-item">
                <div class="agent-av ag-mk">MK</div>
                <div class="agent-info">
                  <h4>市场分析</h4>
                  <p>调研中</p>
                </div>
                <div class="agent-online"></div>
              </li>
              <li class="agent-item">
                <div class="agent-av ag-ux">UX</div>
                <div class="agent-info">
                  <h4>用户体验</h4>
                  <p>可用性评估</p>
                </div>
                <div class="agent-online"></div>
              </li>
              <li class="agent-item">
                <div class="agent-av ag-sys">SYS</div>
                <div class="agent-info">
                  <h4>系统协调器</h4>
                  <p>监控中</p>
                </div>
                <div class="agent-online"></div>
              </li>
            </ul>
          </div>
          <div class="divider"></div>
          <div class="s-section">
            <div class="s-section-title">流程进度</div>
            <div class="progress-stack">
              <div class="prog-row">
                <div class="prog-label"><span>整体进度</span><span id="overallPct">45%</span></div>
                <div class="prog-bar">
                  <div
                    class="prog-fill"
                    id="overallFill"
                    style="width:45%;background:linear-gradient(90deg,#2196f3,#64b5f6)"
                  ></div>
                </div>
              </div>
              <div class="prog-row">
                <div class="prog-label"><span>需求分析</span><span>90%</span></div>
                <div class="prog-bar">
                  <div
                    class="prog-fill"
                    style="width:90%;background:linear-gradient(90deg,#4CAF50,#8BC34A)"
                  ></div>
                </div>
              </div>
              <div class="prog-row">
                <div class="prog-label"><span>任务分解</span><span>60%</span></div>
                <div class="prog-bar">
                  <div
                    class="prog-fill"
                    style="width:60%;background:linear-gradient(90deg,#2196F3,#03A9F4)"
                  ></div>
                </div>
              </div>
              <div class="prog-row">
                <div class="prog-label"><span>自演化学习</span><span>25%</span></div>
                <div class="prog-bar">
                  <div
                    class="prog-fill"
                    style="width:25%;background:linear-gradient(90deg,#9C27B0,#673AB7)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="s-section">
            <div class="s-section-title">最近活动</div>
            <div class="activity-list">
              <div class="activity-item amber">
                <i class="fas fa-info-circle"></i><span>技术经理已完成任务分解，等待您的确认</span>
              </div>
              <div class="activity-item green">
                <i class="fas fa-check-circle"></i><span>预检查通过，所有前提条件已满足</span>
              </div>
              <div class="activity-item blue">
                <i class="fas fa-bolt"></i><span>自演化引擎检测到优化机会</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      (function () {
        "use strict";

        // ---------- 输入框自适应 ----------
        const chatInput = document.getElementById("chatInput");
        chatInput.addEventListener("input", () => {
          chatInput.style.height = "auto";
          chatInput.style.height = Math.min(chatInput.scrollHeight, 110) + "px";
        });
        chatInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
        document.getElementById("sendBtn").addEventListener("click", sendMessage);

        const messagesEl = document.getElementById("messages");
        const newMsgEl = document.getElementById("newMessages");
        const replies = [
          "好的，关于您提到的需求，系统正在处理中 📊",
          "当前项目进度：45%。任务分解已完成，等待开始执行。自演化引擎正在分析历史数据以优化执行策略。",
          "所有6个专业智能体均在线工作：PM、PD、TM、MK、UX、SYS，协同处理中。",
          '当前项目已分解为42个任务，分布在3个迭代中，点击"开始执行"按钮启动执行阶段。',
          "自演化机制已激活，当前学习进度25%。预计本轮演化将在2小时后完成。",
        ];
        let replyIdx = 0;

        function scrollBottom() {
          messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
        }
        function mkBubble(html, cls) {
          const d = document.createElement("div");
          d.className = `bubble-row ${cls}`;
          d.innerHTML = html;
          newMsgEl.appendChild(d);
          scrollBottom();
          return d;
        }
        function showTyping() {
          const d = document.createElement("div");
          d.className = "bubble-row bot";
          d.id = "typingRow";
          d.innerHTML =
            '<div class="bubble-avatar av-sys">SYS</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
          newMsgEl.appendChild(d);
          scrollBottom();
        }
        function removeTyping() {
          const el = document.getElementById("typingRow");
          if (el) el.remove();
        }
        function now() {
          const d = new Date();
          return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
        }

        async function sendMessage() {
          const text = chatInput.value.trim();
          if (!text) return;
          chatInput.value = "";
          chatInput.style.height = "auto";
          mkBubble(
            '<div class="bubble-avatar av-usr">用户</div><div class="bubble"><div class="msg-header"><span class="msg-sender">产品经理（用户）</span><span class="msg-type">用户输入</span></div>' +
              text +
              '<div class="msg-time">' +
              now() +
              "</div></div>",
            "user",
          );
          showTyping();
          await new Promise((r) => setTimeout(r, 1100 + Math.random() * 600));
          removeTyping();
          const reply = replies[replyIdx++ % replies.length];
          mkBubble(
            '<div class="bubble-avatar av-sys">SYS</div><div class="bubble"><div class="msg-header"><span class="msg-sender">系统协调器</span><span class="think-badge"><i class="fas fa-brain"></i> 实时思考</span><span class="msg-type">系统响应</span></div>' +
              reply +
              '<div class="msg-time">' +
              now() +
              "</div></div>",
            "bot",
          );
        }

        // ---------- 进度联动 ----------
        const overallFill = document.getElementById("overallFill");
        const overallPct = document.getElementById("overallPct");
        const topProgressFill = document.getElementById("topProgressFill");
        const topOverallPercent = document.getElementById("topOverallPercent");
        function updateAllProgress(percent) {
          if (overallFill) overallFill.style.width = percent;
          if (overallPct) overallPct.textContent = percent;
          if (topProgressFill) topProgressFill.style.width = percent;
          if (topOverallPercent) topOverallPercent.textContent = percent;
        }

        const approveBtn = document.getElementById("approveBtn");
        if (approveBtn) {
          approveBtn.addEventListener("click", function () {
            updateAllProgress("60%");
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-check"></i> 已批准';
            this.className = "act-btn act-secondary";
            document.querySelectorAll(".phase-step")[2].classList.add("completed");
            mkBubble(
              '<div class="bubble"><i class="fas fa-check-circle"></i> 需求已批准！进入任务分解阶段。</div>',
              "sys",
            );
          });
        }

        const startExecBtn = document.getElementById("startExecBtn");
        if (startExecBtn) {
          startExecBtn.addEventListener("click", function () {
            updateAllProgress("75%");
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 执行中...';
            this.className = "act-btn act-secondary";
            let steps = document.querySelectorAll(".phase-step");
            steps[3].classList.remove("active");
            steps[3].classList.add("completed");
            steps[4].classList.add("active");
            mkBubble(
              '<div class="bubble"><i class="fas fa-play-circle"></i> 项目执行已启动！进入执行监控阶段。</div>',
              "sys",
            );
            setTimeout(() => {
              mkBubble(
                '<div class="bubble-avatar av-pm">PM</div><div class="bubble"><div class="msg-header"><span class="msg-sender">项目经理智能体</span><span class="think-badge"><i class="fas fa-chart-simple"></i> 监控中</span><span class="msg-type">执行监控启动</span></div>执行监控已启动，系统将：<ul style="margin-left:16px;margin-top:7px;"><li>实时跟踪42个任务的执行状态</li><li>监控资源使用情况</li><li>检测风险并自动调整计划</li><li>收集执行数据用于自演化学习</li></ul><div class="msg-time">' +
                  now() +
                  "</div></div>",
                "bot",
              );
            }, 1200);
            setTimeout(() => {
              mkBubble(
                '<div class="bubble-avatar av-sys">SYS</div><div class="bubble"><div class="msg-header"><span class="msg-sender">系统协调器</span><span class="think-badge"><i class="fas fa-robot"></i> 自演化</span><span class="msg-type">执行进度</span></div><strong>迭代1执行进度更新：</strong><div class="tbox" style="margin-top:9px;"><div class="task-item"><div class="tdot done"></div><div><div class="task-name">数据库设计</div><div class="task-det">已完成 · 提前1天</div></div></div><div class="task-item"><div class="tdot prog"></div><div><div class="task-name">API接口开发</div><div class="task-det">进行中 · 70%</div></div></div><div class="task-item"><div class="tdot pend"></div><div><div class="task-name">前端框架搭建</div><div class="task-det">待开始 · 计划明天</div></div></div></div><div class="suggestion" style="margin-top:10px;"><strong>自演化优化：</strong>检测到API开发进度较慢，系统已自动分配额外资源，预计可提前1天完成。</div><div class="msg-time">' +
                  now() +
                  "</div></div>",
                "bot",
              );
            }, 3500);
          });
        }

        // ---------- 抽屉控制：左侧历史抽屉 & 右侧状态抽屉 ----------
        const historyDrawer = document.getElementById("historyDrawer");
        const statusDrawer = document.getElementById("mobileDrawer");
        const mask = document.getElementById("drawerMask");
        const historyToggleBtn = document.getElementById("historyToggleBtn");
        const statusToggleBtn = document.getElementById("drawerToggleBtn");
        const backIcon = document.getElementById("backIcon");
        const statusIcon = document.getElementById("statusIcon");

        function isMobile() {
          return window.matchMedia("(max-width: 760px)").matches;
        }

        // 更新移动端图标：左侧汉堡/返回，右侧状态图标
        function updateMobileIcons() {
          if (isMobile()) {
            // 左侧返回按钮变成汉堡
            if (backIcon) {
              backIcon.className = "fas fa-bars";
            }
            // 右侧分享图标变成 bars (状态抽屉触发)
            if (statusIcon) {
              statusIcon.className = "fas fa-sliders-h"; // 使用滑块图标代表状态
            }
          } else {
            if (backIcon) {
              backIcon.className = "fas fa-arrow-left";
            }
            if (statusIcon) {
              statusIcon.className = "fas fa-share-alt";
            }
            // 桌面强制关闭所有抽屉
            if (historyDrawer) historyDrawer.classList.remove("active");
            if (statusDrawer) statusDrawer.classList.remove("active");
            if (mask) mask.classList.remove("active");
          }
        }

        // 打开左侧历史抽屉
        function openHistoryDrawer() {
          if (!historyDrawer || !mask) return;
          historyDrawer.classList.add("active");
          mask.classList.add("active");
          // 如果右侧开着，关闭它（避免同时两个抽屉）
          if (statusDrawer) statusDrawer.classList.remove("active");
        }

        // 打开右侧状态抽屉
        function openStatusDrawer() {
          if (!statusDrawer || !mask) return;
          statusDrawer.classList.add("active");
          mask.classList.add("active");
          if (historyDrawer) historyDrawer.classList.remove("active");
        }

        // 关闭所有抽屉
        function closeAllDrawers() {
          if (historyDrawer) historyDrawer.classList.remove("active");
          if (statusDrawer) statusDrawer.classList.remove("active");
          if (mask) mask.classList.remove("active");
        }

        // 左侧按钮点击
        function onHistoryClick(e) {
          e.preventDefault();
          if (isMobile()) {
            if (historyDrawer.classList.contains("active")) {
              closeAllDrawers();
            } else {
              openHistoryDrawer();
            }
          } else {
            // 桌面返回功能
            alert("返回上级（桌面演示）");
          }
        }

        // 右侧按钮点击
        function onStatusClick(e) {
          e.preventDefault();
          if (isMobile()) {
            if (statusDrawer.classList.contains("active")) {
              closeAllDrawers();
            } else {
              openStatusDrawer();
            }
          } else {
            alert("分享功能开发中（桌面视图）");
          }
        }

        // 遮罩点击关闭所有
        if (mask) {
          mask.addEventListener("click", closeAllDrawers);
        }

        // 绑定事件
        if (historyToggleBtn) historyToggleBtn.addEventListener("click", onHistoryClick);
        if (statusToggleBtn) statusToggleBtn.addEventListener("click", onStatusClick);

        // 监听窗口变化
        window.addEventListener("resize", function () {
          updateMobileIcons();
          if (!isMobile()) {
            closeAllDrawers();
          }
        });

        // 智能体条目切换高亮
        document.querySelectorAll(".agent-item").forEach((item) => {
          item.addEventListener("click", function () {
            document.querySelectorAll(".agent-item").forEach((i) => i.classList.remove("active"));
            this.classList.add("active");
          });
        });

        // 系统开关联动
        const sysToggle = document.getElementById("sysToggle");
        if (sysToggle) {
          sysToggle.addEventListener("change", function () {
            const dot = this.closest(".toggle-row")?.querySelector(".toggle-dot");
            if (dot) dot.style.background = this.checked ? "#4caf50" : "#9ca3af";
          });
        }
        const evoToggle = document.getElementById("evoToggle");
        if (evoToggle) {
          evoToggle.addEventListener("change", function () {
            const dot = this.closest(".toggle-row")?.querySelector(".toggle-dot");
            if (dot) dot.style.background = this.checked ? "#9c27b0" : "#9ca3af";
          });
        }

        // 初始化图标和抽屉状态
        updateMobileIcons();
        scrollBottom();
      })();
    </script>
  </body>
</html>
```

### 移动双抽屉与消息视觉升级

为了让移动端操作更直观，我们对界面进行了两项关键改造，并统一了消息视觉风格。

1.  **新增左侧历史对话抽屉**：在移动视图下，顶部的“返回”箭头会变为**汉堡菜单图标**。点击它，历史对话面板会从左侧滑出；点击右侧的“状态”图标，则滑出系统状态面板。两个抽屉互斥，点击遮罩层即可关闭。
2.  **进度节点垂直排布**：移除了全局进度条，并将每个阶段节点的**文字说明移至图标正下方**，使其在窄屏上更清晰易读。
3.  **消息样式统一优化**：
    - 您发送的消息**背景色改为主题绿色**，且头像与消息气泡**顶部对齐**。
    - 所有智能体的回复，在名称下方都新增了**思考徽章**（如“深度思考中”“任务规划中”），以体现AI的推理过程。
4.  **输入区功能增强**：在输入框两侧新增了**附件**和**语音**按钮，同时**发送按钮**也更新为主题绿色，与整体视觉协调。

---

**优化建议：** 您可以在 `history-list` 中修改历史对话条目，或调整 `think-badge` 的文案来匹配不同的智能体思考状态。
