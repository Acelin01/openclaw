"use client";

import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../elements/tool";

interface SimpleToolProps {
  part: any;
  type: string;
  title?: string;
  renderOutput?: (output: any) => React.ReactNode;
}

export function SimpleTool({ part, type, title, renderOutput }: SimpleToolProps) {
  const { toolCallId, state } = part;

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type={type as any} />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {state === "output-available" && (
          <ToolOutput
            errorText={undefined}
            output={
              renderOutput ? (
                <div className="space-y-2 p-4">
                  {title && (
                    <div className="mb-2 text-sm font-medium text-muted-foreground">{title}:</div>
                  )}
                  {renderOutput(part.output)}
                </div>
              ) : (
                part.output
              )
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
}
