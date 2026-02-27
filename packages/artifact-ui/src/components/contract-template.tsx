import { Response } from "./response";

interface ContractTemplateProps {
  content: string;
}

export function ContractTemplate({ content }: ContractTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm border my-4 min-h-[800px]">
      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert">
        <Response>{content}</Response>
      </div>
    </div>
  );
}
