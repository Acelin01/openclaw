/**
 * 文件上传路由
 */

import express, { Router } from 'express';
import multer from 'multer';
import { uploadService } from '../services/upload.service.js';

const router: Router = express.Router();

// 配置 multer 内存存储
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * POST /api/uploads/avatar
 * 上传头像 (自动压缩至 500KB)
 */
router.post('/avatar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择文件'
      });
    }

    const result = await uploadService.upload(req.file, {
      compress: true,
      maxWidth: 500,
      maxHeight: 500,
      quality: 80,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: '头像上传成功',
        data: {
          url: result.url,
          size: result.size,
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error('头像上传错误:', error);
    return res.status(500).json({
      success: false,
      message: '上传失败'
    });
  }
});

/**
 * POST /api/uploads/id-card
 * 上传身份证照片 (用于实名认证)
 */
router.post('/id-card', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择文件'
      });
    }

    const result = await uploadService.upload(req.file, {
      compress: true,
      maxWidth: 1200,
      maxHeight: 800,
      quality: 85,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: '身份证上传成功',
        data: {
          url: result.url,
          size: result.size,
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error('身份证上传错误:', error);
    return res.status(500).json({
      success: false,
      message: '上传失败'
    });
  }
});

/**
 * POST /api/uploads/business-license
 * 上传营业执照 (用于企业认证)
 */
router.post('/business-license', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择文件'
      });
    }

    const result = await uploadService.upload(req.file, {
      compress: true,
      maxWidth: 1600,
      maxHeight: 1200,
      quality: 90,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: '营业执照上传成功',
        data: {
          url: result.url,
          size: result.size,
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error('营业执照上传错误:', error);
    return res.status(500).json({
      success: false,
      message: '上传失败'
    });
  }
});

/**
 * DELETE /api/uploads/:filename
 * 删除文件
 */
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const url = `/uploads/${filename}`;
    
    const result = await uploadService.delete(url);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error('删除文件错误:', error);
    return res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

export default router;
