'use client';

import { useState, useEffect } from 'react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { constructApiUrl } from '@/lib/api';
import { 
  WalletCard, 
  TransactionList, 
  InvoiceList,
  Wallet,
  WalletTransaction,
  Invoice,
  TaxRecord,
  Card
} from '@uxin/finance';
import { Loader2, Download, Settings, Plus, Wallet as WalletIcon, FileText, BarChart3, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@uxin/ui';

export default function FinancePage() {
  const { token } = useAuthToken();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Wallet
        const walletUrl = constructApiUrl('/api/v1/finance/wallet');
        const walletRes = await fetch(walletUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const walletData = await walletRes.json();
        if (walletData.success) {
          setWallet(walletData.data);
          if (walletData.data?.transactions) {
            setTransactions(walletData.data.transactions);
          }
        }

        // Fetch Invoices
        const invoiceUrl = constructApiUrl('/api/v1/finance/invoices', { limit: '5' });
        const invoiceRes = await fetch(invoiceUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const invoiceData = await invoiceRes.json();
        if (invoiceData.success) {
          setInvoices(invoiceData.data);
        }

        // Fetch Tax Records
        const taxUrl = constructApiUrl('/api/v1/finance/tax-records', { limit: '5' });
        const taxRes = await fetch(taxUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const taxData = await taxRes.json();
        if (taxData.success) {
          setTaxRecords(taxData.data);
        }

      } catch (error) {
        console.error('Failed to fetch finance data:', error);
        toast.error('获取财务数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-zinc-500">未找到钱包信息，请联系管理员开通。</p>
        <Button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors h-auto font-semibold"
        >
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <header className="px-8 py-6 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
            <WalletIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">薪酬概览</h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">管理您的薪酬发放、自由工作者结算及税务报表</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 h-auto">
            <Plus className="w-4 h-4" />
            发放薪酬
          </Button>
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm h-auto">
            <Download className="w-4 h-4" />
            导出报表
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '总余额', value: `¥${wallet.balance.toLocaleString()}`, change: '+2.5%', icon: WalletIcon, color: 'emerald' },
              { title: '本月发放', value: '¥24,500', change: '+12.3%', icon: Plus, color: 'emerald' },
              { title: '待处理发票', value: '5', change: '-2', icon: Receipt, color: 'amber' },
              { title: '本月扣税', value: '¥1,200', change: '+¥400', icon: FileText, color: 'violet' },
            ].map((stat, i) => (
              <Card key={i} className={cn(
                "p-5 bg-white border-zinc-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all",
                stat.color === 'emerald' ? "border-t-4 border-t-emerald-500" : 
                stat.color === 'amber' ? "border-t-4 border-t-amber-500" : 
                "border-t-4 border-t-violet-500"
              )}>
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : 
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" : 
                    "bg-violet-50 text-violet-600"
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    stat.change.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{stat.value}</h3>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Wallet & Stats */}
            <div className="lg:col-span-4 space-y-8">
              <WalletCard 
                wallet={wallet} 
                onTopUp={() => toast.info('充值功能即将上线')}
                onWithdraw={() => toast.info('提现申请已提交')}
              />
              
              <Card className="p-6 border-zinc-200/60 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <FileText className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-zinc-900">税务概览</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">2024 年度</span>
                </div>
                <div className="space-y-4 relative z-10">
                  {taxRecords.length > 0 ? (
                    taxRecords.map(record => (
                      <div key={record.id} className="group p-3 rounded-xl border border-transparent hover:border-zinc-100 hover:bg-white transition-all">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-zinc-800">{record.taxYear}年度报告</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{record.taxType === 'INCOME_TAX' ? '个人所得税' : '增值税'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-zinc-900">¥{record.amount.toLocaleString()}</p>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                              record.status === 'PAID' ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                            )}>
                              {record.status === 'PAID' ? '已缴纳' : '待缴纳'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-sm text-zinc-400">暂无税务记录</p>
                    </div>
                  )}
                  <Button 
                    variant="ghost"
                    className="w-full mt-4 py-3 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all flex items-center justify-center gap-2 h-auto"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    查看详细税务报告
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Transactions & Invoices */}
            <div className="lg:col-span-8 space-y-8">
              <TransactionList 
                transactions={transactions} 
                onTransactionClick={(tx) => toast.info(`查看交易详情: ${tx.id}`)}
              />
              
              <InvoiceList 
                invoices={invoices}
                onInvoiceClick={(inv) => toast.info(`查看发票详情: ${inv.id}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

