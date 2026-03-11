/**
 * 计费结算模块测试脚本
 * 测试所有计费相关功能
 */

import { billingService } from '../services/billing.service.js';

const TEST_USER_ID = 'test-user-001';

async function runTests() {
  console.log('════════════════════════════════════════');
  console.log('  计费结算模块测试');
  console.log('════════════════════════════════════════\n');

  try {
    // 1. 测试余额查询
    console.log('1️⃣  测试余额查询...');
    let balance = await billingService.getBalance(TEST_USER_ID);
    console.log(`   初始余额：${balance?.balance || 0}`);

    // 2. 测试充值
    console.log('\n2️⃣  测试充值 ¥1000...');
    balance = await billingService.updateBalance(TEST_USER_ID, 1000, 'add');
    console.log(`   充值后余额：${balance?.balance}`);

    // 3. 测试获取统计
    console.log('\n3️⃣  测试获取统计数据...');
    const stats = await billingService.getBillingStats(TEST_USER_ID);
    console.log(`   当前余额：¥${stats.currentBalance}`);
    console.log(`   本月收入：¥${stats.monthlyIncome}`);
    console.log(`   本月支出：¥${stats.monthlyExpense}`);
    console.log(`   待提现：¥${stats.pendingWithdrawal}`);
    console.log(`   优惠券：${stats.couponCount} 张 (¥${stats.couponTotalValue})`);

    // 4. 测试实时扣费
    console.log('\n4️⃣  测试实时扣费 (¥280/h, 每 6 秒)...');
    
    const orderId = `test-order-${Date.now()}`;
    
    billingService.on('billing:tick', (data) => {
      console.log(`   [计费] 订单 ${data.orderId}: ¥${data.currentCost.toFixed(2)} (${data.elapsedSeconds}s)`);
    });

    billingService.on('billing:low_balance', (data) => {
      console.log(`   [警告] 余额不足！当前：¥${data.currentBalance}`);
    });

    billingService.startBillingTimer(orderId, TEST_USER_ID, 280, 6);
    console.log(`   计费已启动：${orderId}`);

    // 等待 15 秒
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 停止计费
    billingService.stopBillingTimer(orderId);
    console.log(`   计费已停止`);

    // 5. 测试查询账单记录
    console.log('\n5️⃣  测试查询账单记录...');
    const records = await billingService.getBillingRecords(TEST_USER_ID, { limit: 5 });
    console.log(`   记录数：${records.length}`);
    records.forEach(r => {
      console.log(`   - ${r.type}: ${r.amount > 0 ? '+' : ''}¥${r.amount} (余额：¥${r.balance})`);
    });

    // 6. 测试收益添加
    console.log('\n6️⃣  测试添加收益...');
    await billingService.addEarnings(TEST_USER_ID, 'test-order-001', 500, 0.12);
    console.log(`   收益已添加：服务费 ¥500, 平台抽成 12%`);

    // 7. 测试获取收益记录
    console.log('\n7️⃣  测试获取收益记录...');
    const earnings = await billingService.getEarningsRecords(TEST_USER_ID, 5);
    console.log(`   收益记录数：${earnings.length}`);
    earnings.forEach(e => {
      console.log(`   - ${e.orderId}: ¥${e.serviceFee} → ¥${e.actualAmount} (${e.status})`);
    });

    // 8. 测试提现
    console.log('\n8️⃣  测试提现申请...');
    try {
      const withdrawal = await billingService.requestWithdrawal(
        TEST_USER_ID,
        200,
        '招商银行',
        '6225880000000000'
      );
      console.log(`   提现申请成功：¥${withdrawal.amount} (${withdrawal.status})`);
    } catch (e: any) {
      console.log(`   提现失败：${e.message}`);
    }

    // 9. 测试获取提现记录
    console.log('\n9️⃣  测试获取提现记录...');
    const withdrawals = await billingService.getWithdrawalRecords(TEST_USER_ID, 5);
    console.log(`   提现记录数：${withdrawals.length}`);
    withdrawals.forEach(w => {
      console.log(`   - ¥${w.amount} to ${w.bank_name} (${w.status})`);
    });

    // 10. 测试自动充值配置
    console.log('\n🔟  测试自动充值配置...');
    const autoConfig = await billingService.updateAutoRechargeConfig(TEST_USER_ID, {
      enabled: true,
      threshold: 100,
      rechargeAmount: 300,
      paymentMethod: 'alipay'
    });
    console.log(`   自动充值：${autoConfig.enabled ? '已启用' : '已禁用'}`);
    console.log(`   触发阈值：¥${autoConfig.threshold}`);
    console.log(`   充值金额：¥${autoConfig.rechargeAmount}`);

    // 11. 测试优惠券
    console.log('\n1️⃣1️⃣  测试优惠券...');
    const coupons = await billingService.getCoupons(TEST_USER_ID);
    console.log(`   优惠券数：${coupons.length}`);

    // 12. 最终余额
    console.log('\n📊  最终余额...');
    balance = await billingService.getBalance(TEST_USER_ID);
    console.log(`   余额：¥${balance?.balance}`);
    console.log(`   冻结：¥${balance?.frozenBalance}`);
    console.log(`   总收入：¥${balance?.totalIncome}`);
    console.log(`   总支出：¥${balance?.totalExpense}`);

    console.log('\n════════════════════════════════════════');
    console.log('  ✅ 测试完成!');
    console.log('════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

runTests();
