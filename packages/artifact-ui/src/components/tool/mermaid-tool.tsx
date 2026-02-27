"use client";

import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../elements/tool";
import { Mermaid } from "../mermaid";

interface MermaidToolProps {
  part: any;
}

export function MermaidTool({ part }: MermaidToolProps) {
  const { toolCallId, state } = part;

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type="tool-createMermaid" />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {state === "output-available" && (
          <ToolOutput
            errorText={undefined}
            output={
              <div className="not-prose w-full">
                <Mermaid code={part.output.code} caption={part.output.caption} />
              </div>
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
}
