import { Badge } from "@uxin/ui";
import { User, Clock } from "lucide-react";
import { parseStructuredContent } from "../lib/utils";
import { Response } from "./response";

interface MessageTemplateProps {
  content: string;
}

export function MessageTemplate({ content }: MessageTemplateProps) {
  let data = {
    title: "",
    recipient: "",
    content: "",
    time: "",
    priority: "Medium",
  };

  try {
    data = parseStructuredContent(content);
  } catch (e) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm border rounded-xl my-4">
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
          <Response>{content}</Response>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white dark:bg-zinc-900 shadow-xl border rounded-2xl overflow-hidden">
      <div className="p-8 border-b bg-muted/10">
        <div className="flex justify-between items-start mb-6">
          <Badge
            variant={data.priority === "High" ? "destructive" : "outline"}
            className="uppercase tracking-widest text-[10px] px-3 py-1 font-bold"
          >
            {data.priority} Priority
          </Badge>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {data.time || "Immediate"}
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-foreground mb-6">
          {data.title || "Message"}
        </h1>

        <div className="flex items-center gap-3 p-3 bg-background border rounded-xl w-fit">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Recipient</div>
            <div className="text-sm font-semibold">{data.recipient || "Not specified"}</div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="prose prose-zinc lg:prose-lg max-w-none dark:prose-invert">
          <Response>{data.content}</Response>
        </div>
      </div>

      <div className="p-8 border-t bg-muted/5 flex justify-between items-center">
        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          End of Message
        </div>
        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
          <div className="size-2 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}
