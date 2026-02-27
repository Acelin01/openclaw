import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

/**
 * 审批数据接口定义
 */
export interface Approval {
  id: string;
  title: string;
  kind: 'approval';
  content: string; // 审批数据的 JSON 字符串
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 审批内容详情接口定义
 */
export interface ApprovalContent {
  title: string;
  requester: string;
  type: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
}

/**
 * 获取审批列表的 Hook
 * @param token 用户认证令牌
 */
export function useApprovals(token?: string) {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      // 过滤 kind 为 approval 的文档
      const url = constructApiUrl('/api/v1/document', { kind: 'approval' });
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Approval[];
    },
    enabled: !!token,
  });
}
