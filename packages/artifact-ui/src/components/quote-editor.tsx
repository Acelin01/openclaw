"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "../lib/utils";

type QuoteEditorProps = {
  title: string;
  content: string;
  mode: "edit" | "diff";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  suggestions: any[];
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata?: any;
  setMetadata?: (updater: any) => void;
};

const DEFAULT_QUOTE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>软件开发服务报价单</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background: linear-gradient(135deg, #1dbf73 0%, #19a463 100%);
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
            border-color: #1dbf73;
            background: rgba(29, 191, 115, 0.05);
        }
        
        .editable:focus {
            outline: none;
            border-color: #1dbf73;
            background: rgba(29, 191, 115, 0.1);
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
            background: #1dbf73;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .edit-mode button:hover {
            background: #19a463;
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
            background: #1dbf73;
            color: white;
        }
        
        .btn-primary:hover {
            background: #19a463;
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
            background: linear-gradient(135deg, #1dbf73 0%, #19a463 100%);
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
            color: #1dbf73;
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
            border-bottom: 3px solid #1dbf73;
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
            box-shadow: 0 5px 15px rgba(29, 191, 115, 0.2);
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
            color: #1dbf73;
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
            color: #1dbf73;
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
            color: #1dbf73;
        }
    </style>
</head>
<body>
    <div class="edit-mode">
        <button onclick="toggleEdit()">✏️ 编辑模式</button>
    </div>
    
    <div class="container">
        <div class="header">
            <h1>软件开发服务报价单</h1>
            <p>专业 · 高效 · 可靠</p>
        </div>
        
        <div class="quote-info">
            <div class="info-block">
                <h3>客户信息</h3>
                <p><strong>公司名称：</strong><span class="editable" contenteditable="false">科技创新有限公司</span></p>
                <p><strong>联系人：</strong><span class="editable" contenteditable="false">张经理</span></p>
                <p><strong>联系电话：</strong><span class="editable" contenteditable="false">138-0000-0000</span></p>
            </div>
            <div class="info-block">
                <h3>报价信息</h3>
                <p><strong>报价单号：</strong><span class="editable" contenteditable="false">QT-2024-1211-001</span></p>
                <p><strong>报价日期：</strong><span class="editable" contenteditable="false">2024年12月11日</span></p>
                <p><strong>有效期：</strong><span class="editable" contenteditable="false">30天</span></p>
            </div>
        </div>
        
        <div class="services">
            <h2>服务项目明细</h2>
            
            <div id="servicesList">
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">需求分析与项目规划</div>
                        <div class="service-desc editable" contenteditable="false">深度需求调研、业务流程分析、技术方案设计</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="15000">¥15,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
                
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">UI/UX设计</div>
                        <div class="service-desc editable" contenteditable="false">界面设计、交互设计、原型制作、视觉规范</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="25000">¥25,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
                
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">前端开发</div>
                        <div class="service-desc editable" contenteditable="false">响应式网页开发、移动端适配、前端交互实现</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="45000">¥45,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
                
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">后端开发</div>
                        <div class="service-desc editable" contenteditable="false">API接口开发、数据库设计、业务逻辑实现</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="60000">¥60,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
                
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">测试与部署</div>
                        <div class="service-desc editable" contenteditable="false">功能测试、性能测试、服务器部署、上线支持</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="20000">¥20,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
                
                <div class="service-item">
                    <div class="service-details">
                        <div class="service-name editable" contenteditable="false">售后服务与维护（6个月）</div>
                        <div class="service-desc editable" contenteditable="false">Bug修复、功能优化、技术咨询</div>
                    </div>
                    <div class="service-price editable" contenteditable="false" data-price="18000">¥18,000</div>
                    <button class="btn btn-delete" onclick="deleteService(this)" style="display:none;">删除</button>
                </div>
            </div>
            
            <button class="btn btn-add" onclick="addService()" style="display:none;">+ 添加服务项目</button>
        </div>
        
        <div class="total-section">
            <div class="subtotal">
                <span>小计：</span>
                <span id="subtotal">¥183,000</span>
            </div>
            <div class="discount">
                <span>优惠折扣（<span class="editable" contenteditable="false" id="discountRate">-10</span>%）：</span>
                <span id="discountAmount">-¥18,300</span>
            </div>
            <div class="total">
                <span>总计：</span>
                <span class="amount" id="totalAmount">¥164,700</span>
            </div>
        </div>
        
        <div class="notes">
            <h3>备注说明</h3>
            <ul>
                <li>本报价为整体项目报价，具体实施以最终签订的合同为准</li>
                <li>项目预计开发周期：3-4个月</li>
                <li>付款方式：签约30% → 开发50% → 验收20%</li>
                <li>报价包含项目管理、文档交付、培训服务</li>
                <li>超出原定需求范围的功能将另行报价</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>感谢您选择我们的服务！</p>
            <div class="contact">
                <p><span class="editable" contenteditable="false">联系我们：400-888-8888 | service@company.com</span></p>
                <p><span class="editable" contenteditable="false">地址：北京市朝阳区科技园区A座10层</span></p>
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
            btn.style.background = isEditMode ? '#28a745' : '#1dbf73';
            
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

export function QuoteEditor({ content, isInline }: QuoteEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = useMemo(() => {
    if (!content || content.trim().length === 0) {
      return DEFAULT_QUOTE_HTML;
    }
    return content.includes("<html") ? content : DEFAULT_QUOTE_HTML;
  }, [content]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Resize handling can be added if needed
  }, [srcDoc]);

  return (
    <div className={cn("relative flex w-full flex-1", isInline ? "min-h-[257px]" : "min-h-[60vh]")}>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        className="absolute inset-0 h-full w-full rounded-b-2xl border border-t-0 dark:border-zinc-700"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
