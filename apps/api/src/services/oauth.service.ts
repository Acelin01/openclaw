/**
 * OAuth 服务 - 支持微信/GitHub 登录
 */

import { DatabaseService } from '../lib/db/service.js';
import jwt from 'jsonwebtoken';

interface OAuthConfig {
  wechat: {
    appId: string;
    appSecret: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
  };
}

interface OAuthUserInfo {
  openId: string;
  unionId?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
}

class OAuthService {
  private config: OAuthConfig = {
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  };

  /**
   * 获取微信授权 URL
   */
  getWechatAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      appid: this.config.wechat.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'snsapi_login',
      ...(state && { state }),
    });

    return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
  }

  /**
   * 获取微信用户信息
   */
  async getWechatUserInfo(code: string): Promise<OAuthUserInfo> {
    try {
      // 1. 获取 access_token
      const tokenResponse = await fetch(
        'https://api.weixin.qq.com/sns/oauth2/access_token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appid: this.config.wechat.appId,
            secret: this.config.wechat.appSecret,
            code,
            grant_type: 'authorization_code',
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.errcode) {
        throw new Error(tokenData.errmsg || '微信授权失败');
      }

      const { access_token, openid, unionid } = tokenData;

      // 2. 获取用户信息
      const userResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
      );

      const userInfo = await userResponse.json();

      return {
        openId: userInfo.openid,
        unionId: unionid || userInfo.unionid,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
      };
    } catch (error) {
      console.error('[OAuth] 微信授权失败:', error);
      throw error;
    }
  }

  /**
   * 获取 GitHub 授权 URL
   */
  getGithubAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.github.clientId,
      redirect_uri: redirectUri,
      scope: 'user:email',
      ...(state && { state }),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * 获取 GitHub 用户信息
   */
  async getGithubUserInfo(code: string): Promise<OAuthUserInfo> {
    try {
      // 1. 获取 access_token
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: this.config.github.clientId,
            client_secret: this.config.github.clientSecret,
            code,
          }),
        }
      );

      const tokenData = await tokenResponse.json();
      const { access_token } = tokenData;

      // 2. 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
          Accept: 'application/json',
        },
      });

      const userInfo = await userResponse.json();

      // 3. 获取邮箱 (如果需要)
      let email = userInfo.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${access_token}`,
            Accept: 'application/json',
          },
        });
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary && e.verified);
        email = primaryEmail?.email;
      }

      return {
        openId: `github:${userInfo.id}`,
        nickname: userInfo.login || userInfo.name,
        avatar: userInfo.avatar_url,
        email,
      };
    } catch (error) {
      console.error('[OAuth] GitHub 授权失败:', error);
      throw error;
    }
  }

  /**
   * 处理 OAuth 登录/注册
   */
  async handleOAuthLogin(
    provider: 'wechat' | 'github',
    userInfo: OAuthUserInfo
  ): Promise<{ user: any; token: string }> {
    const db = DatabaseService.getInstance();

    if (!db.isAvailable()) {
      throw new Error('数据库连接异常');
    }

    // 1. 查找是否已有绑定用户
    let user = await db.getUserByOpenId(provider, userInfo.openId);

    if (!user) {
      // 2. 尝试通过邮箱查找
      if (userInfo.email) {
        user = await db.getUserByEmail(userInfo.email);
        
        if (user) {
          // 绑定 OAuth
          await db.bindOAuth(user.id, provider, userInfo.openId);
        }
      }
    }

    if (!user) {
      // 3. 创建新用户
      user = await db.createUser({
        email: userInfo.email || `${userInfo.openId}@oauth.user`,
        name: userInfo.nickname || `用户_${userInfo.openId.slice(-6)}`,
        password: '', // OAuth 用户无密码
        role: 'CUSTOMER',
        oauthProvider: provider,
        oauthOpenId: userInfo.openId,
        avatar: userInfo.avatar,
        isVerified: !!userInfo.email,
      });
    }

    // 4. 生成 Token
    const token = jwt.sign(
      { id: user.id, role: user.role || 'CUSTOMER' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}

export const oauthService = new OAuthService();
export default oauthService;
