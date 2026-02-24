import ReactDOMServer from "react-dom/server";
import { ProjectManagerCard } from "./project-manager-card.js";
import { ProjectData } from "./types.js";

const styles = `
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f7fb; color: #1f2937; }
  .page { max-width: 1100px; margin: 32px auto; padding: 0 24px 48px; }
  .artifact-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08); overflow: hidden; }
  .artifact-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: linear-gradient(120deg, #eef2ff, #eff6ff); border-bottom: 1px solid #e5e7eb; }
  .artifact-title { font-size: 20px; font-weight: 700; }
  .artifact-subtitle { font-size: 12px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; }
  .artifact-section { padding: 20px 24px 24px; border-bottom: 1px solid #f1f5f9; }
  .artifact-section:last-child { border-bottom: none; }
  h2 { margin: 0 0 16px; font-size: 16px; color: #111827; }
  .kanban-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .kanban-column { background: #f8fafc; border-radius: 12px; padding: 12px; min-height: 200px; }
  .kanban-title { font-weight: 600; margin-bottom: 12px; color: #374151; }
  .kanban-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-bottom: 10px; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04); }
  .kanban-desc { font-size: 14px; margin-bottom: 6px; color: #111827; }
  .kanban-meta { font-size: 12px; color: #6b7280; }
  .kanban-empty { font-size: 12px; color: #9ca3af; padding: 8px 4px; }
  .doc-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .doc-title { font-weight: 600; margin-bottom: 8px; }
  .doc-content { white-space: pre-wrap; font-size: 13px; line-height: 1.6; color: #374151; }
  .doc-empty { font-size: 13px; color: #9ca3af; }
  .footer { font-size: 12px; color: #9ca3af; text-align: right; padding: 12px 24px 20px; }
`;

export const renderArtifactPage = (data: ProjectData) => {
  const body = ReactDOMServer.renderToString(
    <div className="page">
      <ProjectManagerCard data={data} />
      <div className="footer">数据来源：项目工作区</div>
    </div>,
  );

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Artifact Client</title>
    <style>${styles}</style>
  </head>
  <body>${body}</body>
</html>`;
};
