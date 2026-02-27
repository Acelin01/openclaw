import { Badge, Button } from "@uxin/ui";
import { CheckCircle2, Package, Check, Star } from "lucide-react";

interface ServiceData {
  name: string;
  description: string;
  price: string;
  unit?: string;
  category?: string;
  features?: string[];
  deliverables?: string[];
}

interface ServiceTemplateProps {
  content: string;
}

export function ServiceTemplateAlt({ content }: ServiceTemplateProps) {
  let data: ServiceData = { name: "", description: "", price: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing service data.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-[600px] flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl border overflow-hidden relative">
        {data.category && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            {data.category}
          </div>
        )}

        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{data.name}</h1>
          <p className="text-slate-500 text-sm mb-6">{data.description}</p>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900">{data.price}</span>
            {data.unit && <span className="text-slate-500 font-medium">/{data.unit}</span>}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {data.features && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                Features
              </h3>
              <ul className="space-y-3">
                {data.features?.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-blue-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.deliverables && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                Deliverables
              </h3>
              <ul className="space-y-3">
                {data.deliverables?.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors h-auto">
            Inquire Now
          </Button>
        </div>
      </div>
    </div>
  );
}
