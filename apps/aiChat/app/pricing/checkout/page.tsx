"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Receipt, 
  Wallet, 
  ShieldCheck, 
  ChevronLeft,
  Info,
  QrCode
} from "lucide-react";
import { Button } from "@uxin/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethod = "card" | "alipay";

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("支付处理成功！感谢您的订阅。");
      router.push("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* 返回按钮 */}
        <Button 
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-8 transition-colors group h-auto p-0 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">返回套餐选择</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：订阅详情 */}
          <div className="space-y-6">
            {/* 套餐详情 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                订阅详情
              </h2>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-zinc-50">月度套餐 (Plus)</div>
                  <div className="text-sm text-slate-500 dark:text-zinc-400">每月自动续订</div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-red-600 dark:text-red-500">$20.00</span>
                <span className="text-sm text-slate-500 dark:text-zinc-400">/30天</span>
              </div>
              
              <div className="relative pl-5 text-sm text-slate-500 dark:text-zinc-400 mb-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[2px] bg-slate-300 dark:bg-zinc-700" />
                $20.00/30天 从下一个计费周期起生效
              </div>
              
              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">输入促销代码</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="输入促销代码"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Button variant="secondary" className="px-6 rounded-lg text-sm font-semibold">
                    应用
                  </Button>
                </div>
              </div>
            </div>

            {/* 订单摘要 */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-6">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                订单摘要
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Plus 月度套餐</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">$20.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">促销折扣</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">-$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">税费</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">$0.00</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-zinc-50">今日应付</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">$20.00</span>
                </div>
              </div>
            </div>

            {/* 条款说明 */}
            <div className="bg-slate-100/50 dark:bg-zinc-900/30 rounded-2xl p-6 space-y-3 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-zinc-300">重要提示：</p>
              <p>您选择的支付方式和信息将保存并设置为未来扣款的主要支付方式。</p>
              <p>您可以随时取消订阅。当前订阅周期结束后将自动按标准价格续订。</p>
              <p>提交后，您的账户将被保存以便下次快速结账。一旦支付成功，您将被重定向回首页。</p>
            </div>
          </div>

          {/* 右侧：支付信息 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-6">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                支付方式
              </h2>
              
              {/* 支付方式选择 */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                {[
                  { id: "card", label: "信用卡 / 借记卡", icon: <CreditCard className="w-5 h-5" /> },
                  { id: "alipay", label: "支付宝", icon: <Wallet className="w-5 h-5" /> }
                ].map((method) => (
                  <Button
                    key={method.id}
                    variant="ghost"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-xl transition-all text-left group h-auto justify-start hover:bg-transparent",
                      paymentMethod === method.id 
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-600/10" 
                        : "border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      paymentMethod === method.id 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                    )}>
                      {method.icon}
                    </div>
                    <span className={cn(
                      "flex-1 font-medium text-sm",
                      paymentMethod === method.id ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-zinc-300"
                    )}>
                      {method.label}
                    </span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      paymentMethod === method.id 
                        ? "border-blue-600" 
                        : "border-slate-300 dark:border-zinc-700"
                    )}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  </Button>
                ))}
              </div>

              {/* 动态显示的表单部分 */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">卡号</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">有效期</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">CVC</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "alipay" && (
                <div className="text-center py-8 space-y-4 animate-in fade-in slide-in-from-top-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white dark:bg-white rounded-xl shadow-md relative">
                      <QrCode className="w-32 h-32 text-slate-900" />
                      <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-zinc-50">使用支付宝扫码</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">打开手机支付宝扫一扫完成支付</p>
                  </div>
                </div>
              )}

              {/* 安全保证 */}
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">安全支付保证</p>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70 leading-relaxed">
                      您的支付信息已通过 256 位 SSL 加密。我们不会存储您的完整银行卡信息。
                    </p>
                  </div>
                </div>
              </div>

              {/* 支付按钮 */}
              <div className="mt-8">
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>正在处理支付...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>立即支付 $20.00</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            <footer className="text-center py-4">
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                © 2026 柚信 (Uxin) - 助力全球创意与效率
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
