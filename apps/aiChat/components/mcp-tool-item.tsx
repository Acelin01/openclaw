import { useState } from 'react';
import { MCPTool } from '@uxin/mcp';
import { useSkills } from '@/hooks/use-skills';
import { useAuthToken } from '@/hooks/use-auth-token';
import { Button, Badge } from '@uxin/ui';
import { ChevronDown, ChevronUp, Wrench, Circle } from 'lucide-react';

interface MCPToolItemProps {
  tool: MCPTool;
}

export function MCPToolItem({ tool }: MCPToolItemProps) {
  const { token } = useAuthToken();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: skillsData, isLoading } = useSkills(
    { mcpToolId: tool.id },
    token
  );

  const skills = skillsData?.pages.flatMap((page: any) => page) || [];

  return (
    <div className="border rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{tool.name}</h4>
            <Badge variant="outline" className="text-[10px] h-5">
              {tool.version || 'v1.0.0'}
            </Badge>
            {tool.isBuiltIn && (
              <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                内置
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {tool.description || '暂无描述'}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${true ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${true ? 'bg-emerald-500' : 'bg-red-500'}`} />
              已连接
            </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
            <Wrench className="h-3 w-3" />
            包含技能 ({skills.length})
          </h5>
          
          {isLoading ? (
            <div className="text-xs text-zinc-400 py-2">加载技能中...</div>
          ) : skills.length > 0 ? (
            <div className="grid gap-2">
              {skills.map((skill: any) => (
                <div key={skill.id} className="flex items-start gap-2 text-xs p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Circle className="h-1.5 w-1.5 mt-1.5 fill-current text-zinc-400" />
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 block">
                      {skill.name}
                    </span>
                    {skill.description && (
                      <span className="text-zinc-500 block mt-0.5">
                        {skill.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-1">暂无技能</div>
          )}
        </div>
      )}
    </div>
  );
}
