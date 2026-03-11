/**
 * 文件上传服务 - 支持本地存储/OSS
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

interface UploadConfig {
  provider: 'local' | 'aliyun-oss';
  uploadDir: string;
  maxFileSize: number;
  allowedTypes: string[];
}

interface UploadResult {
  success: boolean;
  url: string;
  path?: string;
  size?: number;
  message?: string;
}

class UploadService {
  private config: UploadConfig = {
    provider: (process.env.UPLOAD_PROVIDER as 'local' | 'aliyun-oss') || 'local',
    uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  };

  constructor() {
    // 确保上传目录存在
    if (this.config.provider === 'local') {
      this.ensureUploadDir();
    }
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir() {
    if (!fs.existsSync(this.config.uploadDir)) {
      fs.mkdirSync(this.config.uploadDir, { recursive: true });
      console.log(`[Upload] 创建上传目录：${this.config.uploadDir}`);
    }
  }

  /**
   * 上传文件
   */
  async upload(
    file: Express.Multer.File,
    options?: {
      compress?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    }
  ): Promise<UploadResult> {
    try {
      // 验证文件类型
      if (!this.config.allowedTypes.includes(file.mimetype)) {
        return {
          success: false,
          url: '',
          message: `不支持的文件类型：${file.mimetype}`,
        };
      }

      // 验证文件大小
      if (file.size > this.config.maxFileSize) {
        return {
          success: false,
          url: '',
          message: `文件过大，最大支持 ${this.config.maxFileSize / 1024 / 1024}MB`,
        };
      }

      if (this.config.provider === 'local') {
        return await this.uploadToLocal(file, options);
      } else {
        return await this.uploadToOSS(file, options);
      }
    } catch (error) {
      console.error('[Upload] 上传失败:', error);
      return {
        success: false,
        url: '',
        message: '上传失败，请稍后再试',
      };
    }
  }

  /**
   * 上传到本地存储
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    options?: { compress?: boolean; maxWidth?: number; maxHeight?: number; quality?: number }
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const uploadPath = path.join(this.config.uploadDir, filename);

    let finalPath = uploadPath;

    // 压缩图片 (如果需要)
    if (options?.compress && this.config.allowedTypes.includes(file.mimetype)) {
      const quality = options.quality || 80;
      const maxWidth = options.maxWidth || 800;
      const maxHeight = options.maxHeight || 800;

      await sharp(file.buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toFile(finalPath);

      console.log(`[Upload] 图片已压缩：${filename}`);
    } else {
      // 直接保存
      fs.writeFileSync(finalPath, file.buffer);
    }

    const url = `/uploads/${filename}`;
    const stats = fs.statSync(finalPath);

    return {
      success: true,
      url,
      path: finalPath,
      size: stats.size,
    };
  }

  /**
   * 上传到阿里云 OSS
   */
  private async uploadToOSS(
    file: Express.Multer.File,
    options?: { compress?: boolean; maxWidth?: number; maxHeight?: number; quality?: number }
  ): Promise<UploadResult> {
    const OSS = await import('ali-oss');

    const client = new OSS({
      region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.ALIYUN_OSS_BUCKET || '',
    });

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const ossPath = `uploads/${filename}`;

    let buffer = file.buffer;

    // 压缩图片 (如果需要)
    if (options?.compress && this.config.allowedTypes.includes(file.mimetype)) {
      const quality = options.quality || 80;
      const maxWidth = options.maxWidth || 800;
      const maxHeight = options.maxHeight || 800;

      const compressed = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      buffer = compressed;
    }

    const result = await client.put(ossPath, buffer);

    return {
      success: true,
      url: result.url,
      size: buffer.length,
    };
  }

  /**
   * 删除文件
   */
  async delete(url: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.config.provider === 'local') {
        const filePath = path.join(this.config.uploadDir, path.basename(url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return { success: true, message: '文件已删除' };
        }
      } else {
        const OSS = await import('ali-oss');
        const client = new OSS({
          region: process.env.ALIYUN_OSS_REGION,
          accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
          accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
          bucket: process.env.ALIYUN_OSS_BUCKET,
        });

        await client.delete(path.basename(url));
        return { success: true, message: '文件已删除' };
      }

      return { success: false, message: '文件不存在' };
    } catch (error) {
      console.error('[Upload] 删除失败:', error);
      return { success: false, message: '删除失败' };
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
