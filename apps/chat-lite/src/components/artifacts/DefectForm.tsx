import React from 'react';

interface DefectFormProps {
  data?: {
    id?: string;
    title?: string;
    description?: string;
    severity?: string;
    priority?: string;
    [key: string]: any;
  };
  onSubmit?: (data: any) => void;
}

export function DefectForm({ data, onSubmit }: DefectFormProps) {
  return (
    <div className="defect-form">
      <div className="defect-form-header">
        <h2>{data?.id ? '编辑缺陷' : '新建缺陷'}</h2>
      </div>
      
      <div className="defect-form-body">
        <div className="form-section">
          <label>标题</label>
          <input
            type="text"
            defaultValue={data?.title}
            placeholder="请输入缺陷标题"
            className="form-input"
          />
        </div>
        
        <div className="form-section">
          <label>描述</label>
          <textarea
            defaultValue={data?.description}
            placeholder="请输入缺陷描述"
            className="form-textarea"
            rows={4}
          />
        </div>
        
        <div className="form-row">
          <div className="form-section">
            <label>严重程度</label>
            <select defaultValue={data?.severity || 'medium'} className="form-select">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">严重</option>
            </select>
          </div>
          
          <div className="form-section">
            <label>优先级</label>
            <select defaultValue={data?.priority || 'medium'} className="form-select">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => onSubmit?.({})}>
            {data?.id ? '更新' : '创建'}
          </button>
          <button className="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>
  );
}
