"use client";

import {
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
  Label,
  Textarea,
} from "@uxin/ui";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Loader2,
  Settings2,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { constructApiUrl, toRelativeApiUrl, ensureAbsoluteApiUrl } from "../lib/api";
import { cn } from "../lib/utils";

interface AdminViewProps {
  content: string; // JSON string containing { configId, name, url, schema }
  token?: string;
  onUpdateConfig?: (configId: string, updates: any) => void;
}

export function AdminView({ content, token, onUpdateConfig }: AdminViewProps) {
  const [config, setConfig] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "form" | "detail">("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customFields, setCustomFields] = useState<any[]>([]);

  useEffect(() => {
    if (!content || content.trim() === "") return;

    try {
      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== "object") return;

      setConfig(parsed);

      // 初始化自定义字段配置
      // 优先使用 config 中的 listFields，如果没有则使用 schema.fields
      const fields = parsed?.listFields || parsed?.schema?.fields || [];
      if (fields.length > 0) {
        setCustomFields(
          fields.map((f: any) => ({
            ...f,
            visible: f.visible !== undefined ? f.visible : f.showInList !== false,
          })),
        );
      }
    } catch (e) {
      console.error("Failed to parse admin config", e);
    }
  }, [content]);

  // 当 data 变化且 customFields 为空时（推断模式），从数据中初始化字段
  useEffect(() => {
    // 只有当 customFields 为空，且 (没有配置 schema 或者 schema 中没有任何字段) 时才进行推断
    const hasNoSchemaFields = !config?.schema?.fields || config.schema.fields.length === 0;

    // 检查现有字段是否匹配数据 (防止 schema 生成错误导致显示空白)
    const fieldsMatchData =
      customFields.length > 0 &&
      data.length > 0 &&
      customFields.some((f: any) => Object.prototype.hasOwnProperty.call(data[0], f.name));

    // 如果没有字段定义，或者字段定义与数据完全不匹配，则尝试进行推断
    if ((customFields.length === 0 || !fieldsMatchData) && data.length > 0) {
      // 如果没有配置 schema 或者 schema 字段不匹配数据，则进行推断
      if (hasNoSchemaFields || !fieldsMatchData) {
        console.log("[AdminView] Inferring fields from data (Schema missing or mismatched)");
        const sampleItem = data[0];
        const inferredFields = Object.keys(sampleItem)
          .filter((key) => typeof sampleItem[key] !== "object" || Array.isArray(sampleItem[key]))
          .map((key) => ({
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            type:
              key.toLowerCase().includes("time") || key.toLowerCase().includes("at")
                ? "date"
                : typeof sampleItem[key] === "number"
                  ? "number"
                  : typeof sampleItem[key] === "boolean"
                    ? "boolean"
                    : "string",
            visible: key.toLowerCase() !== "id",
          }));
        setCustomFields(inferredFields);
      }
    } else if (customFields.length === 0 && data.length === 0 && !hasNoSchemaFields) {
      // 关键修复：即便数据为空，如果 Schema 存在，也应该初始化字段，以便显示表头
      console.log("[AdminView] Initializing fields from schema (No data yet)");
      setCustomFields(
        config.schema.fields.map((f: any) => ({
          ...f,
          visible: f.visible !== undefined ? f.visible : f.showInList !== false,
        })),
      );
    }
  }, [data, config?.schema?.fields, customFields.length]);

  useEffect(() => {
    if (config?.url) {
      // 避免在相同 URL 下重复加载
      fetchData();
    }
  }, [config?.url, config?.token, token]);

  const fetchData = async () => {
    if (!config?.url) return;

    setIsLoading(true);
    console.log(`[AdminView] Fetching data from: ${config.url}`);

    try {
      let fetchUrl = toRelativeApiUrl(config.url);
      fetchUrl = ensureAbsoluteApiUrl(fetchUrl);

      console.log(`[AdminView] Final fetch URL: ${fetchUrl}`);

      const requestToken = config.token || token;
      const response = await fetch(fetchUrl, {
        headers: requestToken
          ? {
              Authorization: `Bearer ${requestToken}`,
              Accept: "application/json",
            }
          : {
              Accept: "application/json",
            },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[AdminView] Raw API Response:`, result);

        let actualData = result;

        // 智能提取数组数据的辅助函数 - 增强版 (Generic Extraction)
        const extractArray = (obj: any): any[] | null => {
          if (!obj) return null;
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== "object") return null;

          // 1. 优先检查常见的包装键 (Standard Envelopes)
          const envelopeKeys = [
            "data",
            "items",
            "list",
            "results",
            "records",
            "rows",
            "content",
            "payload",
            "response",
            "body",
            "result",
            "page",
            "users",
            "projects",
            "tasks",
            "templates",
            "products",
            "orders",
          ];

          for (const key of envelopeKeys) {
            if (obj[key]) {
              if (Array.isArray(obj[key])) return obj[key];
              if (typeof obj[key] === "object") {
                const nested = extractArray(obj[key]);
                if (nested) return nested;
              }
            }
          }

          // 2. 如果包装键中没有找到，检查当前对象的所有属性
          const keys = Object.keys(obj);
          const arrayKey =
            keys.find((key) => Array.isArray(obj[key]) && obj[key].length > 0) ||
            keys.find((key) => Array.isArray(obj[key]));

          if (arrayKey) return obj[arrayKey];

          return null;
        };

        const extracted = extractArray(actualData);

        if (extracted) {
          console.log(`[AdminView] Extracted ${extracted.length} items`);
          setData(extracted);
        } else {
          console.log(`[AdminView] Could not find array in response, using as single item array`);
          setData([actualData]);
        }
      } else {
        console.error(`[AdminView] API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`[AdminView] Error body:`, errorText);
        toast({
          title: "加载失败",
          description: `接口返回错误: ${response.status}`,
        });
      }
    } catch (e) {
      console.error(`[AdminView] Fetch Exception:`, e);
      toast({
        title: "网络错误",
        description: "无法连接到 API 接口，请检查 CORS 或网络连接",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedItem(null);
    setViewMode("form");
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setViewMode("form");
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setViewMode("detail");
  };

  const handleDelete = async (item: any) => {
    if (confirm("确定要删除这项吗？")) {
      try {
        const path = `${config.url.startsWith("/") ? "" : "/"}${config.url}/${item.id}`;
        const url = config.url.startsWith("http")
          ? new URL(`${config.url}/${item.id}`)
          : constructApiUrl(path);
        const deleteUrl = url.toString();
        const requestToken = config.token || token;

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: requestToken
            ? {
                Authorization: `Bearer ${requestToken}`,
              }
            : {},
        });

        if (response.ok) {
          setData(data.filter((d) => d.id !== item.id));
          toast({
            title: "删除成功",
            description: "该记录已从列表中移除",
          });
        } else {
          throw new Error("Delete failed");
        }
      } catch (e) {
        // Fallback to mock if API fails or doesn't exist
        setData(data.filter((d) => d.id !== item.id));
        toast({
          title: "删除成功 (演示)",
          description: "API 请求失败，仅更新本地视图",
        });
      }
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const requestToken = config.token || token;
      const url = config.url.startsWith("http") ? new URL(config.url) : constructApiUrl(config.url);
      const baseUrl = url.toString();

      if (selectedItem) {
        // Update
        const updateUrl = `${baseUrl}/${selectedItem.id}`;
        const response = await fetch(updateUrl, {
          method: "PATCH", // Try PATCH first, or PUT
          headers: {
            "Content-Type": "application/json",
            ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updated = await response.json();
          // Use returned data or fallback to formData
          const finalData = updated.data || updated || { ...selectedItem, ...formData };
          setData(data.map((d) => (d.id === selectedItem.id ? finalData : d)));
          toast({ title: "更新成功", description: "记录已更新" });
        } else {
          throw new Error("Update failed");
        }
      } else {
        // Create
        const response = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const created = await response.json();
          const finalData = created.data ||
            created || { id: Math.random().toString(36).substr(2, 9), ...formData };
          setData([finalData, ...data]);
          toast({ title: "创建成功", description: "新记录已添加" });
        } else {
          throw new Error("Create failed");
        }
      }
    } catch (e) {
      // Fallback to mock
      if (selectedItem) {
        setData(data.map((d) => (d.id === selectedItem.id ? { ...d, ...formData } : d)));
        toast({ title: "更新成功 (演示)", description: "API 请求失败，仅更新本地视图" });
      } else {
        setData([{ id: Math.random().toString(36).substr(2, 9), ...formData }, ...data]);
        toast({ title: "创建成功 (演示)", description: "API 请求失败，仅更新本地视图" });
      }
    }
    setViewMode("list");
  };

  const handleSaveFields = (newFields: any[]) => {
    setCustomFields(newFields);
    if (onUpdateConfig && config?.configId) {
      onUpdateConfig(config.configId, { listFields: newFields });
    }
  };

  if (!config) return null;

  const isGenerating = config.status === "generating" || config.status === "pending";

  return (
    <div className="flex flex-col h-full bg-slate-50/30 relative">
      {isGenerating && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wide">正在智能构建管理后台...</span>
              <span className="text-[10px] opacity-80">
                AI 正在根据接口数据 sample 自动生成 Schema 映射
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-[10px]">
            AI 驱动生成中
          </Badge>
        </div>
      )}

      <div className="bg-white px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {viewMode !== "list" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800">{config.name}</h1>
            <p className="text-[10px] text-slate-400">
              {viewMode === "list"
                ? "管理列表数据"
                : viewMode === "form"
                  ? selectedItem
                    ? "编辑数据"
                    : "新增数据"
                  : "数据详情"}
            </p>
          </div>
        </div>
        {viewMode === "list" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={isLoading}
              className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-lg gap-2 shadow-sm"
            >
              <Plus size={16} />
              新增
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "list" ? (
          <AdminListView
            data={data}
            schema={config.schema}
            fields={customFields}
            setFields={handleSaveFields}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : viewMode === "form" ? (
          <AdminFormView
            item={selectedItem}
            schema={config.schema}
            onSave={handleSave}
            onCancel={() => setViewMode("list")}
          />
        ) : (
          <AdminDetailView
            item={selectedItem}
            schema={config.schema}
            onEdit={() => setViewMode("form")}
            onBack={() => setViewMode("list")}
          />
        )}
      </div>
    </div>
  );
}

function AdminListView({
  data,
  schema,
  fields,
  setFields,
  isLoading,
  onEdit,
  onView,
  onDelete,
  searchQuery,
  setSearchQuery,
}: any) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const listFields = fields.filter((f: any) => f.visible !== false);

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const toggleFieldVisibility = (index: number) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], visible: !newFields[index].visible };
    setFields(newFields);
  };

  const filteredData = data.filter((item: any) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="搜索数据..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-slate-200 focus:border-blue-500 rounded-xl"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "h-10 rounded-xl gap-2 border-slate-200 transition-all",
              isSettingsOpen
                ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                : "text-slate-600",
            )}
          >
            <Settings2 size={16} className={cn(isSettingsOpen && "animate-spin-slow")} />
            字段设置
          </Button>

          {isSettingsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-700">配置显示字段</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">拖拽或点击调整列表显示</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  <div className="space-y-1">
                    {fields.map((field: any, index: number) => (
                      <div
                        key={field.name}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl transition-colors",
                          field.visible ? "bg-white" : "bg-slate-50/50 opacity-60",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-slate-300 hover:text-blue-500"
                              onClick={() => moveField(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronLeft className="rotate-90" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-slate-300 hover:text-blue-500"
                              onClick={() => moveField(index, "down")}
                              disabled={index === fields.length - 1}
                            >
                              <ChevronLeft className="-rotate-90" size={12} />
                            </Button>
                          </div>
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                            {field.label || field.name}
                          </span>
                        </div>
                        <Button
                          variant={field.visible ? "default" : "outline"}
                          size="icon"
                          onClick={() => toggleFieldVisibility(index)}
                          className={cn(
                            "h-7 w-7 rounded-lg transition-all",
                            field.visible
                              ? "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
                              : "border-slate-200 text-slate-300",
                          )}
                        >
                          <Check size={14} className={cn(!field.visible && "opacity-0")} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 border-t border-slate-50 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-[11px] font-bold text-blue-600 hover:bg-blue-50"
                  >
                    完成设置
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <Button variant="outline" className="h-10 rounded-xl gap-2 text-slate-600 border-slate-200">
          <Filter size={16} />
          筛选
        </Button>
        <Button variant="outline" className="h-10 rounded-xl gap-2 text-slate-600 border-slate-200">
          <Download size={16} />
          导出
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {listFields.map((field: any, index: number) => (
                  <th
                    key={field.name || `header-${index}`}
                    className="px-4 py-3 font-bold text-slate-600"
                  >
                    {field.label || field.name}
                  </th>
                ))}
                <th className="px-4 py-3 font-bold text-slate-600 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={listFields.length + 1} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      <p className="text-slate-400">正在加载数据...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item: any, i: number) => (
                  <tr
                    key={item.id || i}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors group"
                  >
                    {listFields.map((field: any, index: number) => (
                      <td
                        key={field.name || `cell-${i}-${index}`}
                        className="px-4 py-3 text-slate-600"
                      >
                        {renderValue(item[field.name], field)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                          className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={listFields.length + 1}
                    className="px-4 py-12 text-center text-slate-400 italic"
                  >
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <p className="text-[10px] text-slate-400 font-medium">共 {filteredData.length} 条记录</p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg border-slate-200 text-slate-400 disabled:opacity-30"
              disabled
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg bg-white border-slate-200 text-slate-600 font-bold text-[10px]"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg border-slate-200 text-slate-400 disabled:opacity-30"
              disabled
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminFormView({ item, schema, onSave, onCancel }: any) {
  let fields = schema?.fields || [];

  // 如果没有 schema，从 item 中推断字段
  if (fields.length === 0 && item) {
    fields = Object.keys(item)
      .filter((key) => key !== "id")
      .map((key) => ({
        name: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type:
          typeof item[key] === "number"
            ? "number"
            : typeof item[key] === "boolean"
              ? "boolean"
              : "string",
      }));
  }

  const [formData, setFormData] = useState<any>(item || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {fields.map((field: any, index: number) => (
            <div key={field.name || `form-${index}`} className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {field.label || field.name}
                {field.required && <span className="text-rose-500 ml-1">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={formData[field.name]}
                  onValueChange={(val) => setFormData({ ...formData, [field.name]: val })}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:ring-blue-500">
                    <SelectValue placeholder={`选择${field.label || field.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt: any, optIndex: number) => (
                      <SelectItem key={opt.value || optIndex} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50/50 border-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm resize-none outline-none"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={`输入${field.label || field.name}...`}
                />
              ) : (
                <Input
                  type={
                    field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
                  }
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]:
                        field.type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                  placeholder={`输入${field.label || field.name}...`}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:border-blue-500"
                />
              )}
              {field.description && (
                <p className="text-[10px] text-slate-400 px-1">{field.description}</p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-11 rounded-xl px-6 font-bold text-slate-400 hover:text-slate-600"
          >
            取消
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 gap-2"
          >
            <Save size={18} />
            保存
          </Button>
        </div>
      </form>
    </div>
  );
}

function AdminDetailView({ item, schema, onEdit, onBack }: any) {
  let fields = schema?.fields || [];

  // 如果没有 schema，从 item 中推断字段
  if (fields.length === 0 && item) {
    fields = Object.keys(item).map((key) => ({
      name: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      type:
        typeof item[key] === "number"
          ? "number"
          : typeof item[key] === "boolean"
            ? "boolean"
            : "string",
    }));
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">详细信息</h2>
              <p className="text-[10px] text-slate-400">查看当前记录的所有字段详情</p>
            </div>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            className="h-9 rounded-xl gap-2 border-blue-100 text-blue-600 hover:bg-blue-50 font-bold"
          >
            <Edit2 size={16} />
            编辑
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-4">
          {fields.map((field: any, index: number) => (
            <div
              key={field.name || `detail-${index}`}
              className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50"
            >
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {field.label || field.name}
              </Label>
              <div className="text-sm font-medium text-slate-700">
                {renderValue(item[field.name], field) || (
                  <span className="text-slate-300 italic">未设置</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 gap-1.5"
          >
            <ChevronLeft size={14} />
            返回列表
          </Button>
        </div>
      </div>
    </div>
  );
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

function renderValue(value: any, field: any) {
  if (value === null || value === undefined) return "";

  if (field.type === "status" || field.name === "status") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
          String(value).toLowerCase() === "active" ||
            String(value).toLowerCase() === "enabled" ||
            String(value).toLowerCase() === "success"
            ? "bg-emerald-50 text-emerald-600"
            : String(value).toLowerCase() === "pending" || String(value).toLowerCase() === "warning"
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-100 text-slate-400",
        )}
      >
        {value}
      </Badge>
    );
  }

  if (typeof value === "string" && isEmoji(value)) {
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center border border-slate-100 shadow-sm bg-slate-50 text-base">
        {value}
      </div>
    );
  }

  if (
    field.type === "image" ||
    (typeof value === "string" &&
      value.startsWith("http") &&
      (value.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
        value.includes("avatar") ||
        value.includes("image")))
  ) {
    return (
      <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
        <img
          src={value}
          alt="preview"
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://ui-avatars.com/api/?name=User")}
        />
      </div>
    );
  }

  if (field.type === "email") {
    return (
      <a href={`mailto:${value}`} className="text-blue-500 hover:underline">
        {value}
      </a>
    );
  }

  if (field.type === "phone") {
    return (
      <a href={`tel:${value}`} className="text-blue-500 hover:underline">
        {value}
      </a>
    );
  }

  if (field.type === "number") {
    return <span className="font-mono">{Number(value).toLocaleString()}</span>;
  }

  if (
    field.type === "date" ||
    field.name?.toLowerCase().includes("time") ||
    field.name?.toLowerCase().includes("at")
  ) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    } catch (e) {}
  }

  if (field.type === "select" && field.options) {
    const option = field.options.find((opt: any) => opt.value === value);
    if (option) return option.label;
  }

  if (typeof value === "boolean") {
    return value ? (
      <Badge
        variant="outline"
        className="text-[10px] border-emerald-100 text-emerald-600 bg-emerald-50/30"
      >
        是
      </Badge>
    ) : (
      <Badge variant="outline" className="text-[10px] border-slate-100 text-slate-400">
        否
      </Badge>
    );
  }

  return String(value);
}
