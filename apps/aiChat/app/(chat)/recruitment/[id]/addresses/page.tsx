'use client';

import React from 'react';
import { 
  MapPin, 
  Phone, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2 
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/recruitment';

export default function AddressesPage() {
  const addresses = [
    { 
      id: '1', 
      name: '北京总部', 
      address: '北京市朝阳区三里屯 SOHO A 座 2201', 
      phone: '010-88888888', 
      type: 'HEADQUARTERS',
      staff: 150
    },
    { 
      id: '2', 
      name: '上海分公司', 
      address: '上海市浦东新区陆家嘴金融中心 18 层', 
      phone: '021-66666666', 
      type: 'BRANCH',
      staff: 85
    },
    { 
      id: '3', 
      name: '深圳研发中心', 
      address: '深圳市南山区科技园腾讯大厦旁', 
      phone: '0755-99999999', 
      type: 'RESEARCH',
      staff: 120
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input 
            type="text" 
            placeholder="搜索办公地点名称..." 
            className="w-full pl-9 pr-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:border-[#1dbf73]"
          />
        </div>
        <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none">
          <Plus className="w-4 h-4" /> 添加办公地点
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr) => (
          <Card key={addr.id} className="hover:border-[#1dbf73] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#eef8f3] rounded-xl flex items-center justify-center text-[#1dbf73]">
                <Building2 className="w-6 h-6" />
              </div>
              <Badge variant={addr.type === 'HEADQUARTERS' ? 'dark' : 'secondary'}>
                {addr.type === 'HEADQUARTERS' ? '总部' : addr.type === 'BRANCH' ? '分部' : '研发中心'}
              </Badge>
            </div>
            
            <h4 className="text-lg font-bold text-[#222] mb-2">{addr.name}</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-[#666]">
                <MapPin className="w-4 h-4 mt-0.5 text-[#999] shrink-0" />
                <span>{addr.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <Phone className="w-4 h-4 text-[#999] shrink-0" />
                <span>{addr.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <Plus className="w-4 h-4 text-[#999] shrink-0" />
                <span>员工数量: {addr.staff} 人</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#f0f0f0]">
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2">
                <Edit className="w-3.5 h-3.5" /> 编辑
              </Button>
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-[#e0e0e0]">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
