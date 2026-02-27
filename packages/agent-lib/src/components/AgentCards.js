"use client";
import { cn, isEmoji } from "@uxin/ui";
import { Bot, Sparkles } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const AgentCard = ({ agent, onSelect, onClick, className }) => {
  const handleClick = () => {
    if (onClick) onClick(agent);
    else if (onSelect) onSelect(agent);
  };
  return _jsxs("div", {
    onClick: handleClick,
    className: cn(
      "flex flex-col w-full bg-white rounded-[20px] overflow-hidden transition-all duration-300",
      "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
      "cursor-pointer relative group",
      className,
    ),
    children: [
      _jsx("div", {
        className: "h-2 w-full bg-gradient-to-r from-[#f2a09a] via-[#e8756a] to-[#c4504a]",
      }),
      _jsxs("div", {
        className: "p-5 flex-1 flex flex-col gap-4",
        children: [
          _jsxs("div", {
            className: "flex gap-4 items-start",
            children: [
              _jsxs("div", {
                className: "relative shrink-0",
                children: [
                  _jsx("div", {
                    className: cn(
                      "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#fce8e6,0_4px_12px_rgba(232,117,106,0.2)] overflow-hidden bg-rose-50",
                    ),
                    children: agent.avatar
                      ? isEmoji(agent.avatar)
                        ? _jsx("span", { children: agent.avatar })
                        : _jsx("img", {
                            src: agent.avatar,
                            alt: agent.name,
                            className: "h-full w-full object-cover",
                          })
                      : _jsx("div", {
                          className:
                            "w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white",
                          children: agent.name.substring(0, 1).toUpperCase(),
                        }),
                  }),
                  _jsx("div", {
                    className:
                      "absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm",
                    children: "AI",
                  }),
                ],
              }),
              _jsxs("div", {
                className: "flex-1 min-w-0",
                children: [
                  _jsxs("div", {
                    className: "flex items-center gap-2 mb-1",
                    children: [
                      _jsx("h3", {
                        className:
                          "text-lg font-bold text-slate-800 truncate tracking-tight group-hover:text-rose-600 transition-colors",
                        children: agent.name,
                      }),
                      agent.isCallableByOthers &&
                        _jsxs("div", {
                          className:
                            "flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-rose-100",
                          children: [
                            _jsx(Sparkles, { size: 10 }),
                            _jsx("span", { children: "\u516C\u5F00" }),
                          ],
                        }),
                    ],
                  }),
                  _jsx("p", {
                    className: "text-sm text-slate-500 line-clamp-2 font-light leading-relaxed",
                    children: agent.prompt || "暂无描述，快来和智能体对话吧",
                  }),
                ],
              }),
            ],
          }),
          _jsx("div", { className: "h-px bg-slate-100" }),
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsxs("div", {
                className:
                  "inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full",
                children: [
                  _jsx("span", { className: "font-bold", children: "@" }),
                  _jsx("span", { children: agent.identifier || "smart_agent" }),
                ],
              }),
              _jsx("div", { className: "w-1 h-1 rounded-full bg-slate-200" }),
              _jsxs("div", {
                className: "inline-flex items-center gap-1.5 text-[11px] text-slate-400",
                children: [
                  _jsx(Bot, { size: 12 }),
                  _jsxs("span", { children: [agent.skills?.length || 0, " \u4E2A\u6280\u80FD"] }),
                ],
              }),
              _jsx("div", {
                className: "ml-auto flex gap-1.5",
                children: _jsx("span", {
                  className:
                    "text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded",
                  children: "\u667A\u80FD\u4F53",
                }),
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "mt-auto flex items-center justify-between bg-[#f9f5f0] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100",
            children: [
              _jsx("span", {
                className: "text-[11px] text-slate-400",
                children: "\u7ACB\u5373\u5F00\u59CB\u503E\u8BC9\u4F60\u7684\u56F0\u60D1",
              }),
              _jsxs("button", {
                className:
                  "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] text-white text-xs font-medium shadow-[0_4px_10px_rgba(232,117,106,0.3)] hover:opacity-90 transition-opacity",
                onClick: (e) => {
                  e.stopPropagation();
                  onSelect?.(agent);
                },
                children: [_jsx(Bot, { size: 12 }), "\u9009\u62E9"],
              }),
            ],
          }),
        ],
      }),
    ],
  });
};
export const AIAppCard = ({ app, onAdd, onClick, className, isAdded }) => {
  return _jsxs("div", {
    onClick: () => (onClick ? onClick(app) : !isAdded && onAdd?.(app)),
    className: cn(
      "flex flex-col w-full bg-white rounded-[20px] overflow-hidden transition-all duration-300",
      "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
      "cursor-pointer relative group",
      className,
    ),
    children: [
      _jsx("div", {
        className: "h-2 w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700",
      }),
      _jsxs("div", {
        className: "p-5 flex-1 flex flex-col gap-4",
        children: [
          _jsxs("div", {
            className: "flex gap-4 items-start",
            children: [
              _jsx("div", {
                className: "relative shrink-0",
                children: _jsx("div", {
                  className: cn(
                    "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#eff6ff,0_4px_12px_rgba(59,130,246,0.2)] overflow-hidden bg-blue-50",
                  ),
                  children: app.icon
                    ? isEmoji(app.icon)
                      ? _jsx("span", { children: app.icon })
                      : _jsx("img", {
                          src: app.icon,
                          alt: app.name,
                          className: "h-full w-full object-cover",
                        })
                    : _jsx("div", {
                        className:
                          "w-full h-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white",
                        children: app.type === "PROJECT" ? "🚀" : "🛠️",
                      }),
                }),
              }),
              _jsxs("div", {
                className: "flex-1 min-w-0",
                children: [
                  _jsxs("div", {
                    className: "flex items-center gap-2 mb-1",
                    children: [
                      _jsx("h3", {
                        className:
                          "text-lg font-bold text-slate-800 truncate tracking-tight group-hover:text-blue-600 transition-colors",
                        children: app.name,
                      }),
                      isAdded &&
                        _jsxs("div", {
                          className:
                            "flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-emerald-100",
                          children: [
                            _jsx(Sparkles, { size: 10 }),
                            _jsx("span", { children: "\u5DF2\u6DFB\u52A0" }),
                          ],
                        }),
                    ],
                  }),
                  _jsx("p", {
                    className: "text-sm text-slate-500 line-clamp-2 font-light leading-relaxed",
                    children: app.description || "暂无描述，快来体验强大的 AI 应用吧",
                  }),
                ],
              }),
            ],
          }),
          _jsx("div", { className: "h-px bg-slate-100" }),
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsxs("div", {
                className:
                  "inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full",
                children: [
                  _jsx("span", { className: "font-bold", children: "#" }),
                  _jsx("span", { children: app.type === "PROJECT" ? "项目" : "应用" }),
                ],
              }),
              _jsx("div", { className: "w-1 h-1 rounded-full bg-slate-200" }),
              _jsxs("div", {
                className: "inline-flex items-center gap-1.5 text-[11px] text-slate-400",
                children: [
                  _jsx(Bot, { size: 12 }),
                  _jsxs("span", {
                    children: [app.agents?.length || 0, " \u4E2A\u667A\u80FD\u4F53"],
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "mt-auto flex items-center justify-between bg-[#f0f9ff] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100",
            children: [
              _jsx("span", {
                className: "text-[11px] text-slate-400",
                children: "\u7ACB\u5373\u5F00\u542F\u9AD8\u6548\u5DE5\u4F5C\u4F53\u9A8C",
              }),
              _jsx("button", {
                className: cn(
                  "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-medium shadow-[0_4px_10px_rgba(59,130,246,0.3)] transition-all",
                  isAdded
                    ? "bg-slate-300 shadow-none cursor-default"
                    : "bg-gradient-to-br from-blue-500 to-blue-700 hover:opacity-90",
                ),
                onClick: (e) => {
                  e.stopPropagation();
                  if (!isAdded) onAdd?.(app);
                },
                disabled: isAdded,
                children: isAdded ? "已添加" : "添加应用",
              }),
            ],
          }),
        ],
      }),
    ],
  });
};
//# sourceMappingURL=AgentCards.js.map
