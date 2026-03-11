/**
 * 集成测试脚本 - 订单 + 计费完整流程测试
 * 测试场景：用户浏览服务 → 创建订单 → 实时扣费 → 收益结算 → 提现
 */

import { billingService } from '../services/billing.service.js';

const TEST_USER_ID = 'test-user-001';
const TEST_SELLER_ID = 'test-seller-001';

async function runIntegrationTest() {
  console.log('════════════════════════════════════════════════════');
  console.log('  集成测试 - 订单 + 计费完整流程');
  console.log('════════════════════════════════════════════════════\n');

  const results: { test: string; passed: boolean; error?: string }[] = [];

  try {
    // ════════════════════════════════════════
    // 场景 1: 用户充值
    // ════════════════════════════════════════
    console.log('📝 场景 1: 用户充值');
    console.log('─────────────────────────────────────────────────');
    
    try {
      let balance = await billingService.getBalance(TEST_USER_ID);
      console.log(`   初始余额：¥${balance?.balance || 0}`);

      await billingService.updateBalance(TEST_USER_ID, 5000, 'add');
      balance = await billingService.getBalance(TEST_USER_ID);
      
      const passed = balance?.balance === 5000;
      results.push({ test: '用户充值 ¥5000', passed, error: passed ? undefined : `期望 5000，实际 ${balance?.balance}` });
      console.log(`   充值后余额：¥${balance?.balance} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '用户充值 ¥5000', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 2: 启动实时扣费
    // ════════════════════════════════════════
    console.log('📝 场景 2: 启动实时扣费 (数据分析服务，¥280/h)');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const orderId = `order-${Date.now()}`;
      let tickCount = 0;
      let totalCost = 0;

      const tickHandler = (data: any) => {
        tickCount++;
        totalCost = data.currentCost;
        console.log(`   [扣费 #${tickCount}] ¥${data.currentCost.toFixed(2)} (工时：${data.elapsedSeconds}s, 余额：¥${data.balance.toFixed(2)})`);
      };

      billingService.on('billing:tick', tickHandler);

      await billingService.startBillingTimer(orderId, TEST_USER_ID, 280, 6);
      console.log(`   计费启动：${orderId}`);

      // 等待 20 秒 (约 3-4 次扣费)
      await new Promise(resolve => setTimeout(resolve, 20000));

      billingService.stopBillingTimer(orderId);
      billingService.off('billing:tick', tickHandler);

      const passed = tickCount >= 3;
      results.push({ test: '实时扣费 (20 秒)', passed, error: passed ? undefined : `期望至少 3 次扣费，实际 ${tickCount} 次` });
      console.log(`   扣费次数：${tickCount} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '实时扣费 (20 秒)', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 3: 查询账单记录
    // ════════════════════════════════════════
    console.log('📝 场景 3: 查询账单记录');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const records = await billingService.getBillingRecords(TEST_USER_ID, { limit: 10 });
      const deductionRecords = records.filter(r => r.type === 'deduction');
      
      console.log(`   总记录数：${records.length}`);
      console.log(`   扣费记录：${deductionRecords.length}`);
      
      const passed = deductionRecords.length >= 3;
      results.push({ test: '账单记录查询', passed, error: passed ? undefined : `期望至少 3 条扣费记录，实际 ${deductionRecords.length} 条` });
      
      deductionRecords.slice(0, 3).forEach(r => {
        console.log(`   - ${r.description}: ¥${r.amount} (余额：¥${r.balance})`);
      });
      console.log(`   ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '账单记录查询', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 4: 服务者收益结算
    // ════════════════════════════════════════
    console.log('📝 场景 4: 服务者收益结算');
    console.log('─────────────────────────────────────────────────');
    
    try {
      await billingService.addEarnings(TEST_SELLER_ID, 'order-test-001', 1120, 0.12);
      console.log(`   添加收益：服务费 ¥1120`);

      const earnings = await billingService.getEarningsRecords(TEST_SELLER_ID, 5);
      const latestEarning = earnings[0];
      
      const expectedActual = 1120 * (1 - 0.12); // 896
      const passed = latestEarning?.serviceFee === 1120;
      
      results.push({ test: '收益结算', passed, error: passed ? undefined : `服务费不匹配` });
      console.log(`   服务费：¥${latestEarning?.serviceFee}`);
      console.log(`   平台抽成 (12%): ¥${(1120 * 0.12).toFixed(2)}`);
      console.log(`   实际到账：¥${expectedActual}`);
      console.log(`   状态：${latestEarning?.status} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '收益结算', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 5: 获取统计数据
    // ════════════════════════════════════════
    console.log('📝 场景 5: 获取统计数据');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const stats = await billingService.getBillingStats(TEST_USER_ID);
      
      console.log(`   当前余额：¥${stats.currentBalance.toFixed(2)}`);
      console.log(`   本月支出：¥${stats.monthlyExpense.toFixed(2)}`);
      console.log(`   优惠券：${stats.couponCount} 张`);
      
      const passed = stats.currentBalance < 5000; // 应该有扣费
      results.push({ test: '统计数据', passed, error: passed ? undefined : `余额应该有变化` });
      console.log(`   ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '统计数据', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 6: 提现申请
    // ════════════════════════════════════════
    console.log('📝 场景 6: 提现申请');
    console.log('─────────────────────────────────────────────────');
    
    try {
      // 先给服务者添加一些余额
      await billingService.updateBalance(TEST_SELLER_ID, 2000, 'add');
      
      const withdrawal = await billingService.requestWithdrawal(
        TEST_SELLER_ID,
        1000,
        '招商银行',
        '6225880000000000'
      );
      
      const passed = withdrawal.status === 'pending' && withdrawal.amount === 1000;
      results.push({ test: '提现申请', passed, error: passed ? undefined : `提现状态或金额不正确` });
      console.log(`   提现金额：¥${withdrawal.amount}`);
      console.log(`   状态：${withdrawal.status} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '提现申请', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 7: 自动充值配置
    // ════════════════════════════════════════
    console.log('📝 场景 7: 自动充值配置');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const config = await billingService.updateAutoRechargeConfig(TEST_USER_ID, {
        enabled: true,
        threshold: 200,
        rechargeAmount: 500,
        paymentMethod: 'alipay'
      });
      
      const passed = config.enabled && config.threshold === 200;
      results.push({ test: '自动充值配置', passed, error: passed ? undefined : `配置不正确` });
      console.log(`   启用状态：${config.enabled}`);
      console.log(`   触发阈值：¥${config.threshold}`);
      console.log(`   充值金额：¥${config.rechargeAmount}`);
      console.log(`   支付方式：${config.paymentMethod} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '自动充值配置', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

    // ════════════════════════════════════════
    // 场景 8: 优惠券兑换
    // ════════════════════════════════════════
    console.log('📝 场景 8: 优惠券兑换');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const coupon = await billingService.addCoupon(TEST_USER_ID, 'WELCOME80');
      
      const passed = coupon !== null && coupon.amount === 80;
      results.push({ test: '优惠券兑换', passed, error: passed ? undefined : `优惠券兑换失败` });
      console.log(`   券码：WELCOME80`);
      console.log(`   面额：¥${coupon?.amount}`);
      console.log(`   名称：${coupon?.name} ${passed ? '✅' : '❌'}\n`);
    } catch (e: any) {
      results.push({ test: '优惠券兑换', passed: false, error: e.message });
      console.log(`   ❌ 失败：${e.message}\n`);
    }

  } catch (error: any) {
    console.error('\n❌ 测试中断:', error.message);
  }

  // ════════════════════════════════════════
  // 测试报告
  // ════════════════════════════════════════
  console.log('════════════════════════════════════════════════════');
  console.log('  测试报告');
  console.log('════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach((r, i) => {
    console.log(`${r.passed ? '✅' : '❌'} ${i + 1}. ${r.test}`);
    if (!r.passed && r.error) {
      console.log(`   错误：${r.error}`);
    }
  });

  console.log('\n─────────────────────────────────────────────────');
  console.log(`总计：${results.length} 项测试`);
  console.log(`通过：${passed} ✅`);
  console.log(`失败：${failed} ❌`);
  console.log(`通过率：${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTest();
