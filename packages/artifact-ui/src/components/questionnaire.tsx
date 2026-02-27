"use client";

import {
  Button,
  Input,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Label,
} from "@uxin/ui";
import { ChevronRightIcon, HelpCircle, UserIcon } from "lucide-react";
import { useState } from "react";

interface Question {
  id: string;
  label: string;
  placeholder?: string;
  suggestion?: string;
}

interface QuestionnaireProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitted?: boolean;
  result?: Record<string, string>;
}

export function Questionnaire({
  questions,
  onSubmit,
  isSubmitted = false,
  result,
}: QuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted || result) {
    const displayAnswers = result || answers;
    return (
      <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 my-2">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="flex items-center justify-center w-5 h-5 bg-zinc-200 rounded-full">
                <UserIcon className="size-3" />
              </div>
              <span className="text-xs font-medium italic">该工具由客户提供回复</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
              <span>查看回复</span>
              <ChevronRightIcon className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3 pt-3 border-t border-zinc-100">
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    {q.label}
                  </div>
                  <div className="text-sm text-zinc-800 bg-white border border-zinc-100 rounded-lg px-3 py-2 shadow-sm">
                    {displayAnswers[q.id] || "未填写"}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-indigo-100 rounded-xl p-4 space-y-4 my-2 shadow-sm">
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="flex items-center justify-center w-5 h-5 bg-indigo-50 rounded">
              <HelpCircle className="size-3.5" />
            </div>
            <h4 className="font-semibold text-sm text-left">请回答以下问题以继续</h4>
          </div>
          <ChevronRightIcon className="size-4 text-indigo-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={q.id} className="text-xs font-medium text-zinc-600 block">
                  {q.label}
                </Label>
                <Input
                  id={q.id}
                  placeholder={q.placeholder || "请输入..."}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  className="rounded-lg border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {q.suggestion && (
                  <div className="flex items-start gap-2 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                    <HelpCircle className="size-3.5 text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-indigo-700/80">
                      <span className="font-semibold mr-1">AI 建议:</span>
                      {q.suggestion}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 h-10 shadow-md transition-all active:scale-[0.98]"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>提交中...</span>
              </div>
            ) : (
              "提交答复并继续思考"
            )}
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
