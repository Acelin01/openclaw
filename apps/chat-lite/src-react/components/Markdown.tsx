/**
 * Markdown 渲染组件
 * 支持 GitHub Flavored Markdown
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Markdown.css';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 标题
          h1: ({node, ...props}) => <h1 {...props} />,
          h2: ({node, ...props}) => <h2 {...props} />,
          h3: ({node, ...props}) => <h3 {...props} />,
          h4: ({node, ...props}) => <h4 {...props} />,
          h5: ({node, ...props}) => <h5 {...props} />,
          h6: ({node, ...props}) => <h6 {...props} />,
          
          // 段落
          p: ({node, ...props}) => <p {...props} />,
          
          // 列表
          ul: ({node, ...props}) => <ul {...props} />,
          ol: ({node, ...props}) => <ol {...props} />,
          li: ({node, ...props}) => <li {...props} />,
          
          // 引用
          blockquote: ({node, ...props}) => <blockquote {...props} />,
          
          // 代码
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className={`code-block ${className}`}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          
          // 表格
          table: ({node, ...props}) => <table {...props} />,
          thead: ({node, ...props}) => <thead {...props} />,
          tbody: ({node, ...props}) => <tbody {...props} />,
          tr: ({node, ...props}) => <tr {...props} />,
          th: ({node, ...props}) => <th {...props} />,
          td: ({node, ...props}) => <td {...props} />,
          
          // 其他
          hr: ({node, ...props}) => <hr {...props} />,
          strong: ({node, ...props}) => <strong {...props} />,
          em: ({node, ...props}) => <em {...props} />,
          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
