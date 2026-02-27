import { createDocumentHandler } from "@/lib/artifacts/server";

const DEFAULT_QUOTE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>软件开发服务报价单</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; min-height: 100vh; }
        .editable { border: 1px dashed transparent; padding: 2px 4px; border-radius: 3px; transition: all 0.2s; cursor: text; }
        .editable:hover { border-color: #667eea; background: rgba(102, 126, 234, 0.05); }
        .editable:focus { outline: none; border-color: #667eea; background: rgba(102, 126, 234, 0.1); }
        .edit-mode { position: fixed; top: 20px; right: 20px; background: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 1000; }
        .edit-mode button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
        .edit-mode button:hover { background: #5568d3; transform: translateY(-2px); }
        .action-buttons { display: flex; gap: 10px; justify-content: center; padding: 20px 40px; background: white; }
        .btn { padding: 12px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: all 0.3s; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5568d3; transform: translateY(-2px); }
        .btn-secondary { background: #28a745; color: white; }
        .btn-secondary:hover { background: #218838; transform: translateY(-2px); }
        .btn-add { background: #17a2b8; color: white; margin-top: 15px; width: 100%; }
        .btn-add:hover { background: #138496; }
        .btn-delete { background: #dc3545; color: white; padding: 8px 15px; font-size: 14px; margin-left: 10px; }
        .btn-delete:hover { background: #c82333; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .quote-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 30px 40px; background: #f8f9fa; border-bottom: 2px solid #e9ecef; }
        .info-block h3 { color: #667eea; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .info-block p { color: #333; font-size: 16px; line-height: 1.6; }
        .services { padding: 40px; }
        .services h2 { color: #333; font-size: 24px; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #667eea; }
        .service-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 15px; background: #f8f9fa; border-radius: 8px; transition: all 0.3s ease; }
        .service-item:hover { transform: translateX(5px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2); }
        .service-details { flex: 1; }
        .service-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .service-desc { font-size: 14px; color: #666; }
        .service-price { font-size: 24px; font-weight: bold; color: #667eea; margin-left: 20px; }
        .total-section { padding: 30px 40px; background: #f8f9fa; border-top: 2px solid #e9ecef; }
        .subtotal, .discount, .total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; }
        .subtotal { color: #666; }
        .discount { color: #28a745; }
        .total { font-size: 24px; font-weight: bold; color: #333; padding-top: 20px; border-top: 2px solid #dee2e6; margin-top: 10px; }
        .total .amount { color: #667eea; font-size: 32px; }
        .notes { padding: 30px 40px; background: #fff3cd; border-top: 2px solid #ffc107; }
        .notes h3 { color: #856404; font-size: 16px; margin-bottom: 15px; }
        .notes ul { list-style-position: inside; color: #856404; line-height: 1.8; }
        .footer { padding: 30px 40px; text-align: center; background: #f8f9fa; color: #666; font-size: 14px; }
        .contact { margin-top: 15px; font-size: 16px; color: #667eea; }
    </style>
</head>
<body>...CONTENT TRUNCATED FOR BREVITY...</body>
</html>`;

export const quoteDocumentHandler = createDocumentHandler<"quote">({
  kind: "quote",
  onCreateDocument: async ({ title, dataStream }) => {
    const html = DEFAULT_QUOTE_HTML.replace(
      "<h1>软件开发服务报价单</h1>",
      `<h1>${title || "软件开发服务报价单"}</h1>`
    );

    dataStream.write({
      type: "data-quoteDelta",
      data: html,
      transient: true,
    });

    return html;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    const updated = (document.content || DEFAULT_QUOTE_HTML).replace(
      "<p>专业 · 高效 · 可靠</p>",
      `<p>${description || "专业 · 高效 · 可靠"}</p>`
    );
    dataStream.write({
      type: "data-quoteDelta",
      data: updated,
      transient: true,
    });
    return updated;
  },
});

