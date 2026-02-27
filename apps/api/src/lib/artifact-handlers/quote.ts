import { streamObject } from "ai";
import { z } from "zod";
import { quotePrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/factory.js";

const quoteSchema = z.object({
  title: z.string().describe("The main title of the quotation"),
  customer: z.object({
    companyName: z.string().describe("Client company name"),
    contactName: z.string().describe("Client contact person"),
    phone: z.string().describe("Client phone number"),
  }),
  quoteInfo: z.object({
    number: z.string().describe("Quote number e.g. QT-YYYY-MMDD-001"),
    date: z.string().describe("Quote date"),
    validity: z.string().describe("Validity period e.g. 30 days"),
  }),
  services: z.array(
    z.object({
      name: z.string().describe("Service name"),
      description: z.string().describe("Service description"),
      price: z.number().describe("Price in currency units"),
    })
  ).describe("List of services"),
  discountRate: z.number().describe("Discount percentage (0-100)"),
  notes: z.array(z.string()).describe("List of notes or terms"),
  contact: z.object({
    info: z.string().describe("Company contact info string"),
    address: z.string().describe("Company address"),
  }),
});

type QuoteData = z.infer<typeof quoteSchema>;

function generateQuoteHtml(data: DeepPartial<QuoteData>) {
  const title = data.title || "软件开发服务报价单";
  const customer = {
    companyName: data.customer?.companyName || "科技创新有限公司",
    contactName: data.customer?.contactName || "张经理",
    phone: data.customer?.phone || "138-0000-0000",
  };
  const quoteInfo = {
    number: data.quoteInfo?.number || "QT-2024-1211-001",
    date: data.quoteInfo?.date || new Date().toLocaleDateString("zh-CN"),
    validity: data.quoteInfo?.validity || "30天",
  };
  const services = data.services || [];
  const discountRate = data.discountRate ?? 0;
  const notes = data.notes || [
    "本报价为整体项目报价，具体实施以最终签订的合同为准",
    "项目预计开发周期：3-4个月",
    "付款方式：签约30% → 开发50% → 验收20%",
  ];
  const contact = {
    info: data.contact?.info || "联系我们：400-888-8888 | service@company.com",
    address: data.contact?.address || "地址：北京市朝阳区科技园区A座10层",
  };

  // Calculate totals for initial render
  const subtotal = services.reduce((sum, s) => sum + (s?.price || 0), 0);
  const discountAmount = subtotal * (Math.abs(discountRate) / 100);
  const total = subtotal - discountAmount;

  const servicesHtml = services
    .map(
      (s) => `
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">${
                          s?.name || "服务项目"
                        }</div>
                        <div class="service-desc editable" contenteditable="false">${
                          s?.description || "服务描述"
                        }</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="${
                      s?.price || 0
                    }">¥${(s?.price || 0).toLocaleString()}</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>`
    )
    .join("");

  const notesHtml = notes.map((n) => `<li>${n || ""}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .editable {
            border: 1px dashed transparent;
            padding: 2px 4px;
            border-radius: 3px;
            transition: all 0.2s;
            cursor: text;
        }
        
        .editable:hover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }
        
        .editable:focus {
            outline: none;
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }
        
        .edit-mode {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .edit-mode button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .edit-mode button:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            padding: 20px 40px;
            background: white;
        }
        
        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #28a745;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        
        .btn-add {
            background: #17a2b8;
            color: white;
            margin-top: 15px;
            width: 100%;
        }
        
        .btn-add:hover {
            background: #138496;
        }
        
        .btn-delete {
            background: #dc3545;
            color: white;
            padding: 8px 15px;
            font-size: 14px;
            margin-left: 10px;
        }
        
        .btn-delete:hover {
            background: #c82333;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .quote-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 30px 40px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        
        .info-block h3 {
            color: #667eea;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-block p {
            color: #333;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .services {
            padding: 40px;
        }
        
        .services h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
        }
        
        .service-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            margin-bottom: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .service-item:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        
        .service-details {
            flex: 1;
        }
        
        .service-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .service-desc {
            font-size: 14px;
            color: #666;
        }
        
        .service-price {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-left: 20px;
        }
        
        .total-section {
            padding: 30px 40px;
            background: #f8f9fa;
            border-top: 2px solid #e9ecef;
        }
        
        .subtotal, .discount, .total {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 18px;
        }
        
        .subtotal {
            color: #666;
        }
        
        .discount {
            color: #28a745;
        }
        
        .total {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
            margin-top: 10px;
        }
        
        .total .amount {
            color: #667eea;
            font-size: 32px;
        }
        
        .notes {
            padding: 30px 40px;
            background: #fff3cd;
            border-top: 2px solid #ffc107;
        }
        
        .notes h3 {
            color: #856404;
            font-size: 16px;
            margin-bottom: 15px;
        }
        
        .notes ul {
            list-style-position: inside;
            color: #856404;
            line-height: 1.8;
        }
        
        .footer {
            padding: 30px 40px;
            text-align: center;
            background: #f8f9fa;
            color: #666;
            font-size: 14px;
        }
        
        .contact {
            margin-top: 15px;
            font-size: 16px;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="edit-mode">
        <button onclick="toggleEdit()">✏️ 编辑模式</button>
    </div>
    
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>专业 · 高效 · 可靠</p>
        </div>
        
        <div class="quote-info">
            <div class="info-block">
                <h3>客户信息</h3>
                <p><strong>公司名称：</strong><span class="editable" contenteditable="false">${
                  customer.companyName
                }</span></p>
                <p><strong>联系人：</strong><span class="editable" contenteditable="false">${
                  customer.contactName
                }</span></p>
                <p><strong>联系电话：</strong><span class="editable" contenteditable="false">${
                  customer.phone
                }</span></p>
            </div>
            <div class="info-block">
                <h3>报价信息</h3>
                <p><strong>报价单号：</strong><span class="editable" contenteditable="false">${
                  quoteInfo.number
                }</span></p>
                <p><strong>报价日期：</strong><span class="editable" contenteditable="false">${
                  quoteInfo.date
                }</span></p>
                <p><strong>有效期：</strong><span class="editable" contenteditable="false">${
                  quoteInfo.validity
                }</span></p>
            </div>
        </div>
        
        <div class="services">
            <h2>服务项目明细</h2>
            
            <div id="servicesList">
                ${servicesHtml}
            </div>
            
            <button class="btn btn-add" onclick="addService()" style="display:none;">+ 添加服务项目</button>
        </div>
        
        <div class="total-section">
            <div class="subtotal">
                <span>小计：</span>
                <span id="subtotal">¥${subtotal.toLocaleString()}</span>
            </div>
            <div class="discount">
                <span>优惠折扣（<span class="editable" contenteditable="false" id="discountRate">${
                  discountRate > 0 ? "-" : ""
                }${discountRate}</span>%）：</span>
                <span id="discountAmount">${
                  discountAmount > 0 ? "-" : ""
                }¥${discountAmount.toLocaleString()}</span>
            </div>
            <div class="total">
                <span>总计：</span>
                <span class="amount" id="totalAmount">¥${total.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="notes">
            <h3>备注说明</h3>
            <ul>
                ${notesHtml}
            </ul>
        </div>
        
        <div class="footer">
            <p>感谢您选择我们的服务！</p>
            <div class="contact">
                <p><span class="editable" contenteditable="false">${
                  contact.info
                }</span></p>
                <p><span class="editable" contenteditable="false">${
                  contact.address
                }</span></p>
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="printQuote()">🖨️ 打印报价单</button>
            <button class="btn btn-secondary" onclick="downloadQuote()">💾 导出PDF</button>
        </div>
    </div>
    
    <script>
        let isEditMode = false;
        
        function toggleEdit() {
            isEditMode = !isEditMode;
            const editables = document.querySelectorAll('.editable');
            const deleteButtons = document.querySelectorAll('.btn-delete');
            const addButton = document.querySelector('.btn-add');
            
            editables.forEach(el => {
                el.contentEditable = isEditMode;
            });
            
            deleteButtons.forEach(btn => {
                btn.style.display = isEditMode ? 'inline-block' : 'none';
            });
            
            if (addButton) {
                addButton.style.display = isEditMode ? 'block' : 'none';
            }
            
            const btn = event.target;
            btn.textContent = isEditMode ? '✓ 完成编辑' : '✏️ 编辑模式';
            btn.style.background = isEditMode ? '#28a745' : '#667eea';
            
            if (!isEditMode) {
                calculateTotal();
            }
        }
        
        function calculateTotal() {
            let subtotal = 0;
            const prices = document.querySelectorAll('.service-price');
            
            prices.forEach(priceEl => {
                const text = priceEl.textContent.replace(/[¥,]/g, '');
                const price = parseFloat(text) || 0;
                priceEl.setAttribute('data-price', price);
                subtotal += price;
            });
            
            const discountRate = parseFloat(document.getElementById('discountRate').textContent) || 0;
            const discount = subtotal * (Math.abs(discountRate) / 100);
            const total = subtotal - discount;
            
            document.getElementById('subtotal').textContent = '¥' + subtotal.toLocaleString();
            document.getElementById('discountAmount').textContent = '-¥' + discount.toLocaleString();
            document.getElementById('totalAmount').textContent = '¥' + total.toLocaleString();
        }
        
        function addService() {
            const servicesList = document.getElementById('servicesList');
            const newService = document.createElement('div');
            newService.className = 'service-item';
            newService.innerHTML = \`
                <div class="service-details">
                    <div class="service-name editable" contenteditable="true">新服务项目</div>
                    <div class="service-desc editable" contenteditable="true">请输入服务描述</div>
                </div>
                <div class="service-price editable" contenteditable="true" data-price="0">¥0</div>
                <button class="btn btn-delete" onclick="deleteService(this)">删除</button>
            \`;
            servicesList.appendChild(newService);
        }
        
        function deleteService(btn) {
            if (confirm('确定要删除这个服务项目吗？')) {
                btn.parentElement.remove();
                calculateTotal();
            }
        }
        
        function printQuote() {
            window.print();
        }
        
        function downloadQuote() {
            alert('PDF导出功能需要后端支持。当前您可以使用浏览器的"打印"功能，选择"另存为PDF"来保存报价单。');
            window.print();
        }
        
        document.getElementById('discountRate').addEventListener('blur', calculateTotal);
        
        document.querySelectorAll('.service-price').forEach(el => {
            el.addEventListener('blur', function() {
                const text = this.textContent.replace(/[¥,]/g, '');
                const price = parseFloat(text) || 0;
                this.textContent = '¥' + price.toLocaleString();
                calculateTotal();
            });
        });
    </script>
</body>
</html>`;
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const quoteDocumentHandler = createDocumentHandler<"quote">({
  kind: "quote",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: quotePrompt,
      prompt: title,
      schema: quoteSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const html = generateQuoteHtml(object);
          dataStream.write({
            type: "data-quoteDelta",
            data: html,
            transient: true,
          });

          draftContent = html;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = document.content || "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "quote"),
      prompt: description,
      schema: quoteSchema,
    });

    for await (const delta of fullStream) {
        const { type } = delta;
  
        if (type === "object") {
          const { object } = delta;
          
          if (object) {
            const html = generateQuoteHtml(object);
            dataStream.write({
              type: "data-quoteDelta",
              data: html,
              transient: true,
            });
  
            draftContent = html;
          }
        }
      }
  
      return draftContent;
  },
});
