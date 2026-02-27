import { Badge, Separator } from "@uxin/ui";
import { ApprovalData } from "./approval-editor";

interface ApprovalTemplateProps {
  content: string;
}

export function ApprovalTemplate({ content }: ApprovalTemplateProps) {
  let data: ApprovalData = {
    title: "",
    requester: "",
    type: "",
    details: "",
    status: "Pending",
  };

  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing approval data.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-sm border rounded-lg min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.title || "Untitled Request"}</h1>
          <p className="text-sm text-gray-500 mt-1">Approval Request</p>
        </div>
        <Badge className={getStatusColor(data.status)}>{data.status}</Badge>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-gray-500 mb-1">Requester</span>
          <span className="font-medium text-gray-900">{data.requester || "Unknown"}</span>
        </div>
        <div>
          <span className="block text-gray-500 mb-1">Type</span>
          <span className="font-medium text-gray-900">{data.type || "General"}</span>
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Details
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border p-4 rounded-md">
          {data.details || "No details provided."}
        </div>
      </div>
    </div>
  );
}
