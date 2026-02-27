export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline";

export type Surface =
  | "chat"
  | "auth"
  | "api"
  | "stream"
  | "database"
  | "history"
  | "vote"
  | "document"
  | "suggestions"
  | "activate_gateway";

export type ErrorCode = `${ErrorType}:${Surface}`;

export class ChatSDKError extends Error {
  type: ErrorType;
  surface: Surface;
  statusCode: number;
  override cause?: any; // Changed from string to any to be more flexible

  constructor(errorCode: ErrorCode, cause?: any) {
    const safeErrorCode = errorCode || "bad_request:api";
    super(getMessageByErrorCode(safeErrorCode));
    this.name = 'ChatSDKError';

    const [type, surface] = safeErrorCode.split(":") as [ErrorType, Surface];

    this.type = type || "bad_request";
    this.cause = cause;
    this.surface = surface || "api";
    this.statusCode = getStatusCodeByType(this.type);
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes("database")) {
    return "执行数据库查询时发生错误。";
  }

  switch (errorCode) {
    case "bad_request:api":
      return "请求无法处理，请检查您的输入并重试。";

    case "bad_request:activate_gateway":
      return "AI 网关需要有效的信用卡信息才能提供服务。";

    case "unauthorized:auth":
      return "请先登录。";
    case "forbidden:auth":
      return "您的账号没有访问此功能的权限。";

    case "rate_limit:chat":
      return "您已达到当天的消息发送上限，请稍后再试。";
    case "not_found:chat":
      return "未找到所请求的对话，请检查对话 ID。";
    case "forbidden:chat":
      return "此对话属于其他用户，请检查对话 ID。";
    case "unauthorized:chat":
      return "请登录后查看此对话。";
    case "offline:chat":
      return "消息发送失败，请检查您的网络连接。";

    case "not_found:document":
      return "未找到所请求的文档，请检查文档 ID。";
    case "forbidden:document":
      return "此文档属于其他用户，请检查文档 ID。";
    case "unauthorized:document":
      return "请登录后查看此文档。";
    case "bad_request:document":
      return "文档创建或更新请求无效，请检查您的输入。";

    default:
      return "发生错误，请稍后再试。";
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "offline":
      return 503;
    default:
      return 500;
  }
}
