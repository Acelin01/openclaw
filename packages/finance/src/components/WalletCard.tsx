import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";
import React from "react";
import { Wallet } from "../types";
import { formatCurrency } from "../utils/format";
import { Card } from "./shared-ui";

interface WalletCardProps {
  wallet: Wallet;
  className?: string;
  onTopUp?: () => void;
  onWithdraw?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  className,
  onTopUp,
  onWithdraw,
}) => {
  return (
    <Card
      className={`p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white overflow-hidden relative ${className}`}
    >
      <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <WalletIcon className="w-5 h-5" />
            <span className="text-sm font-medium">我的钱包</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm border border-white/10">
            {wallet.currency}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm text-zinc-400 mb-1">总资产</div>
          <div className="text-4xl font-bold tracking-tight">
            {formatCurrency(wallet.balance, wallet.currency)}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onTopUp}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            充值
          </button>
          <button
            onClick={onWithdraw}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            提现
          </button>
        </div>
      </div>
    </Card>
  );
};
