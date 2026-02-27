"use client";

import { useState } from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Input,
  Label,
  Textarea
} from "@uxin/ui";
import { Plus, Briefcase, Loader2 } from "lucide-react";
import { createServiceAction } from "./actions";
import { toast } from "@/components/toast";

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({ type: "error", description: "请填写完整信息" });
      return;
    }

    setLoading(true);
    try {
      await createServiceAction({ title, content });
      toast({ type: "success", description: "服务创建成功" });
      setOpen(false);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create service:", error);
      toast({ type: "error", description: "创建失败，请重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> 创建服务
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              发布新服务
            </DialogTitle>
            <DialogDescription>
              作为自由职业者，您可以发布专业服务供其他用户查看和咨询。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">服务名称</Label>
              <Input
                id="title"
                placeholder="例如：高级 UI/UX 设计服务"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">服务描述</Label>
              <Textarea
                id="content"
                placeholder="详细描述您提供的服务内容、交付物和优势..."
                className="min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发布中...
                </>
              ) : (
                "立即发布"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
