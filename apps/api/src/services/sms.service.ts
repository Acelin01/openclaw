/**
 * 短信服务 - 支持阿里云/腾讯云
 */

interface SmsConfig {
  provider: 'aliyun' | 'tencent';
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  templateCode: string;
}

class SmsService {
  private config: SmsConfig | null = null;
  private isInitialized = false;

  /**
   * 初始化短信服务
   */
  init(provider: 'aliyun' | 'tencent' = 'aliyun') {
    const prefix = provider === 'aliyun' ? 'ALIYUN' : 'TENCENT';
    
    this.config = {
      provider,
      accessKeyId: process.env[`${prefix}_ACCESS_KEY_ID`] || '',
      accessKeySecret: process.env[`${prefix}_ACCESS_KEY_SECRET`] || '',
      signName: process.env[`${prefix}_SMS_SIGN_NAME`] || '技能共享平台',
      templateCode: process.env[`${prefix}_SMS_TEMPLATE_CODE`] || '',
    };

    // 开发环境使用模拟模式
    if (process.env.NODE_ENV === 'development' && !this.config.accessKeyId) {
      console.log('[SMS] 使用模拟模式 (未配置短信服务商)');
      this.isInitialized = true;
      return;
    }

    if (!this.config.accessKeyId || !this.config.accessKeySecret) {
      console.error('[SMS] 配置不完整，短信服务不可用');
      return;
    }

    this.isInitialized = true;
    console.log(`[SMS] ${provider} 短信服务已初始化`);
  }

  /**
   * 发送验证码短信
   */
  async sendVerificationCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return { success: false, message: '短信服务未初始化' };
    }

    // 开发环境模拟发送
    if (process.env.NODE_ENV === 'development' && !this.config?.accessKeyId) {
      console.log(`[SMS Mock] 验证码 ${code} 发送到 ${phone}`);
      return { success: true, message: '验证码已发送 (模拟模式)' };
    }

    try {
      if (this.config?.provider === 'aliyun') {
        return await this.sendViaAliyun(phone, code);
      } else if (this.config?.provider === 'tencent') {
        return await this.sendViaTencent(phone, code);
      }

      return { success: false, message: '未知的短信服务商' };
    } catch (error) {
      console.error('[SMS] 发送失败:', error);
      return { success: false, message: '发送失败，请稍后再试' };
    }
  }

  /**
   * 通过阿里云发送
   */
  private async sendViaAliyun(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    // 使用阿里云 SDK
    const Dysmsapi20170525 = await import('@alicloud/dysmsapi20170525');
    const OpenApi = await import('@alicloud/openapi-client');

    const config = new OpenApi.Config({
      accessKeyId: this.config!.accessKeyId,
      accessKeySecret: this.config!.accessKeySecret,
      endpoint: 'dysmsapi.aliyuncs.com',
    });

    const client = new Dysmsapi20170525.default(config);

    const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: this.config!.signName,
      templateCode: this.config!.templateCode,
      templateParam: JSON.stringify({ code }),
    });

    const response = await client.sendSms(sendSmsRequest);
    
    if (response.body?.code === 'OK') {
      return { success: true, message: '验证码已发送' };
    }

    return { success: false, message: response.body?.message || '发送失败' };
  }

  /**
   * 通过腾讯云发送
   */
  private async sendViaTencent(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    const tencentcloud = await import('tencentcloud-sdk-nodejs');
    const SmsClient = tencentcloud.sms.v20210111.Client;

    const client = new SmsClient({
      credential: {
        secretId: this.config!.accessKeyId,
        secretKey: this.config!.accessKeySecret,
      },
      region: 'ap-guangzhou',
    });

    const params = {
      PhoneNumberSet: [`+86${phone}`],
      TemplateId: this.config!.templateCode,
      SignName: this.config!.signName,
      TemplateParamSet: [code],
    };

    const response = await client.SendSms(params);

    if (response.SendStatusSet?.[0]?.Code === 'Ok') {
      return { success: true, message: '验证码已发送' };
    }

    return { success: false, message: response.SendStatusSet?.[0]?.Message || '发送失败' };
  }
}

export const smsService = new SmsService();
export default smsService;
