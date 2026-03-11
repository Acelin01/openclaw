/**
 * ServiceCompare - 服务对比功能
 * 对应文档：服务市场.md (F03-10)
 * 
 * 功能:
 * - 选择多个服务对比
 * - 对比表格展示
 * - 参数差异高亮
 * - 最多对比 4 个服务
 */

import React, { useState } from 'react';
import './ServiceCompare.css';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerType: 'robot' | 'human' | 'hybrid';
  tags: string[];
  responseTime: string;
  deliveryTime: string;
  isCertified?: boolean;
  packages?: ServicePackage[];
}

interface ServicePackage {
  type: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: number;
  features: string[];
  deliveryTime: string;
  revisions: number;
}

interface ServiceCompareProps {
  services: Service[];
  onRemove: (serviceId: string) => void;
  onClear: () => void;
}

export const ServiceCompare: React.FC<ServiceCompareProps> = ({
  services,
  onRemove,
  onClear,
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  if (services.length === 0) {
    return null;
  }

  // 对比维度
  const compareDimensions = [
    { key: 'name', label: '服务名称' },
    { key: 'basePrice', label: '起始价格', type: 'price' },
    { key: 'rating', label: '评分', type: 'rating' },
    { key: 'reviewCount', label: '评价数', type: 'number' },
    { key: 'sellerName', label: '服务商' },
    { key: 'sellerType', label: '服务类型', type: 'type' },
    { key: 'responseTime', label: '响应时间' },
    { key: 'deliveryTime', label: '交付时间' },
    { key: 'isCertified', label: '平台认证', type: 'boolean' },
    { key: 'tags', label: '标签', type: 'tags' },
  ];

  // 获取对比值
  const getCompareValue = (service: Service, key: string): any => {
    return (service as any)[key];
  };

  // 检查某维度是否有差异
  const hasDifference = (key: string): boolean => {
    if (!highlightDifferences) return false;
    const values = services.map(s => getCompareValue(s, key));
    return new Set(values).size > 1;
  };

  // 渲染值
  const renderValue = (service: Service, key: string) => {
    const value = getCompareValue(service, key);
    const type = compareDimensions.find(d => d.key === key)?.type;

    switch (type) {
      case 'price':
        return <span className="compare-price">¥{value}</span>;
      case 'rating':
        return (
          <span className="compare-rating">
            {'★'.repeat(Math.floor(value))}
            {'☆'.repeat(5 - Math.floor(value))}
            <strong>{value}</strong>
          </span>
        );
      case 'number':
        return <span className="compare-number">{value}</span>;
      case 'type':
        return (
          <span className={`compare-type type-${value}`}>
            {value === 'robot' ? '🤖 机器人' : value === 'human' ? '👤 人工' : '🔀 混合'}
          </span>
        );
      case 'boolean':
        return value ? <span className="compare-boolean yes">✓ 是</span> : <span className="compare-boolean no">✗ 否</span>;
      case 'tags':
        return (
          <div className="compare-tags">
            {value.map((tag: string) => (
              <span key={tag} className="compare-tag">{tag}</span>
            ))}
          </div>
        );
      default:
        return <span className="compare-text">{value}</span>;
    }
  };

  // 渲染套餐对比
  const renderPackageComparison = () => {
    const allPackages = services.flatMap(s => s.packages || []);
    if (allPackages.length === 0) return null;

    const packageTypes = ['BASIC', 'PRO', 'ENTERPRISE'];

    return (
      <div className="package-comparison">
        <h3>套餐对比</h3>
        {packageTypes.map(type => {
          const packages = services.map(s => s.packages?.find(p => p.type === type)).filter(Boolean) as ServicePackage[];
          if (packages.length === 0) return null;

          return (
            <div key={type} className="package-type-comparison">
              <div className="package-type-header">{packages[0]?.name}</div>
              {services.map(service => {
                const pkg = service.packages?.find(p => p.type === type);
                if (!pkg) return <div key={service.id} className="package-cell empty">-</div>;
                return (
                  <div key={service.id} className="package-cell">
                    <div className="package-price">¥{pkg.price}</div>
                    <div className="package-delivery">交付：{pkg.deliveryTime}</div>
                    <div className="package-revisions">修改：{pkg.revisions >= 999 ? '无限' : `${pkg.revisions}次`}</div>
                    <ul className="package-features">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="feature-item">✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="service-compare">
      <div className="compare-header">
        <h2>服务对比</h2>
        <div className="compare-actions">
          <label className="highlight-toggle">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
            />
            高亮差异
          </label>
          <button className="clear-btn" onClick={onClear}>
            清空对比 ({services.length})
          </button>
        </div>
      </div>

      <div className="compare-table">
        <table>
          <thead>
            <tr>
              <th className="dimension-column">对比项</th>
              {services.map(service => (
                <th key={service.id} className="service-column">
                  <div className="service-header">
                    <button className="remove-btn" onClick={() => onRemove(service.id)}>✕</button>
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-name">{service.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareDimensions.map(dim => (
              <tr key={dim.key} className={hasDifference(dim.key) ? 'has-difference' : ''}>
                <td className="dimension-label">{dim.label}</td>
                {services.map(service => (
                  <td key={service.id} className="dimension-value">
                    {renderValue(service, dim.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPackageComparison()}

      <div className="compare-footer">
        <p>💡 提示：最多可对比 4 个服务，点击"✕"移除不需要的服务</p>
      </div>
    </div>
  );
};

export default ServiceCompare;
