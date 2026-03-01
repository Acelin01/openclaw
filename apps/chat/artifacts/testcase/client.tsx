import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import {
  CopyIcon,
  CheckIcon,
  PlayIcon,
  ClockIcon,
  AlertCircleIcon,
} from "@/components/icons";

type TestCaseStep = {
  step: string;
  action: string;
  expected: string;
};

type TestCaseContent = {
  title: string;
  description?: string;
  type: "FUNCTIONAL" | "INTEGRATION" | "PERFORMANCE" | "SECURITY" | "REGRESSION" | "ACCEPTANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId?: string;
  precondition?: string;
  steps?: TestCaseStep[];
  expectedResult?: string;
  tags?: string[];
  status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
};

type TestCaseMetadata = {
  testCaseId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const testcaseArtifact = new Artifact<"testcase", TestCaseMetadata>({
  kind: "testcase",
  description: "用于显示和编辑测试用例",
  initialize: async ({ setMetadata }) => {
    setMetadata({});
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "data-testcase") {
      const data = streamPart.data as TestCaseContent & { id?: string };
      
      setMetadata((metadata) => ({
        testCaseId: data.id,
        createdAt: new Date().toISOString(),
      }));

      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority,
          projectId: data.projectId,
          precondition: data.precondition,
          steps: data.steps,
          expectedResult: data.expectedResult,
          tags: data.tags,
          status: data.status || "DRAFT",
        }),
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ({ content, metadata, onSaveContent }) => {
    const testCase = JSON.parse(content) as TestCaseContent;

    const getTypeColor = (type: string) => {
      const colors: Record<string, string> = {
        FUNCTIONAL: "bg-blue-100 text-blue-800",
        INTEGRATION: "bg-purple-100 text-purple-800",
        PERFORMANCE: "bg-yellow-100 text-yellow-800",
        SECURITY: "bg-red-100 text-red-800",
        REGRESSION: "bg-gray-100 text-gray-800",
        ACCEPTANCE: "bg-green-100 text-green-800",
      };
      return colors[type] || "bg-gray-100 text-gray-800";
    };

    const getPriorityColor = (priority: string) => {
      const colors: Record<string, string> = {
        LOW: "bg-gray-100 text-gray-600",
        MEDIUM: "bg-blue-100 text-blue-600",
        HIGH: "bg-orange-100 text-orange-600",
        CRITICAL: "bg-red-100 text-red-600",
      };
      return colors[priority] || "bg-gray-100 text-gray-600";
    };

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-600",
        PENDING_REVIEW: "bg-yellow-100 text-yellow-600",
        APPROVED: "bg-green-100 text-green-600",
        REJECTED: "bg-red-100 text-red-600",
        ARCHIVED: "bg-gray-100 text-gray-400",
      };
      return colors[status] || "bg-gray-100 text-gray-600";
    };

    return (
      <div className="p-6 space-y-6">
        {/* 标题 */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{testCase.title}</h2>
          {testCase.description && (
            <p className="text-gray-600 mt-2">{testCase.description}</p>
          )}
        </div>

        {/* 基本信息 */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(testCase.type)}`}>
            {testCase.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(testCase.priority)}`}>
            {testCase.priority}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(testCase.status || "DRAFT")}`}>
            {testCase.status || "DRAFT"}
          </span>
        </div>

        {/* 前置条件 */}
        {testCase.precondition && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
              <AlertCircleIcon size={18} />
              前置条件
            </h3>
            <p className="text-yellow-800 mt-2">{testCase.precondition}</p>
          </div>
        )}

        {/* 测试步骤 */}
        {testCase.steps && testCase.steps.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PlayIcon size={18} />
              测试步骤
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">步骤</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">预期结果</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testCase.steps.map((step, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{step.step}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{step.action}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{step.expected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 预期结果 */}
        {testCase.expectedResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 flex items-center gap-2">
              <CheckIcon size={18} />
              预期结果
            </h3>
            <p className="text-green-800 mt-2">{testCase.expectedResult}</p>
          </div>
        )}

        {/* 标签 */}
        {testCase.tags && testCase.tags.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {testCase.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 项目 ID */}
        {testCase.projectId && (
          <div className="text-sm text-gray-500">
            项目 ID: {testCase.projectId}
          </div>
        )}

        {/* 元数据 */}
        {metadata.testCaseId && (
          <div className="text-xs text-gray-400 border-t pt-4">
            测试用例 ID: {metadata.testCaseId}
          </div>
        )}
      </div>
    );
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: "复制测试用例",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("测试用例已复制到剪贴板");
      },
    },
  ],
});
