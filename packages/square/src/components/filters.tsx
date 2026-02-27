"use client";

export interface SquareFiltersValues {
  plan?: string;
  platform?: string;
  siteType?: string;
  delivery?: string;
}

export function SquareFilters({
  values,
  onChange,
}: {
  values?: SquareFiltersValues;
  onChange?: (name: keyof SquareFiltersValues, value: string) => void;
}) {
  const planOptions = ["all", "basic", "standard", "premium"];
  const platformOptions = ["all", "WordPress", "Webflow", "Wix", "Framer"];
  const siteTypeOptions = ["all", "企业网站", "作品集", "电商"];
  const deliveryOptions = ["any", "24h", "3d", "7d"];

  const defaultPlan =
    values?.plan && planOptions.includes(values.plan) ? values.plan : planOptions[0];
  const defaultPlatform =
    values?.platform && platformOptions.includes(values.platform)
      ? values.platform
      : platformOptions[0];
  const defaultSiteType =
    values?.siteType && siteTypeOptions.includes(values.siteType)
      ? values.siteType
      : siteTypeOptions[0];
  const defaultDelivery =
    values?.delivery && deliveryOptions.includes(values.delivery)
      ? values.delivery
      : deliveryOptions[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-600 mb-2">服务选项</span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          defaultValue={defaultPlan}
          onChange={(e) => onChange?.("plan", e.target.value)}
        >
          <option value="all">所有选项</option>
          <option value="basic">基础</option>
          <option value="standard">标准</option>
          <option value="premium">高级</option>
        </select>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-600 mb-2">平台</span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          defaultValue={defaultPlatform}
          onChange={(e) => onChange?.("platform", e.target.value)}
        >
          <option value="all">所有平台</option>
          <option value="WordPress">WordPress</option>
          <option value="Webflow">Webflow</option>
          <option value="Wix">Wix</option>
          <option value="Framer">Framer</option>
        </select>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-600 mb-2">网站类型</span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          defaultValue={defaultSiteType}
          onChange={(e) => onChange?.("siteType", e.target.value)}
        >
          <option value="all">所有类型</option>
          <option value="企业网站">企业网站</option>
          <option value="作品集">作品集</option>
          <option value="电商">电商</option>
        </select>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-600 mb-2">交付时间</span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          defaultValue={defaultDelivery}
          onChange={(e) => onChange?.("delivery", e.target.value)}
        >
          <option value="any">不限</option>
          <option value="24h">24小时内</option>
          <option value="3d">3天内</option>
          <option value="7d">1周内</option>
        </select>
      </div>
    </div>
  );
}
