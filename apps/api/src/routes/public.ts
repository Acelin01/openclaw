import express, { Router, Response } from 'express'
import { prisma } from '../lib/db/index.js'

const router: Router = express.Router()

// 公开：获取用户详情（包含工作者档案），仅返回安全字段
router.get('/users/:id', async (req, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ success: false, message: '用户ID不能为空' })
      return
    }

    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        workerProfile: {
          include: {
            services: {
              include: {
                packages: { include: { plans: true } },
                faqs: true
              }
            },
            experiences: true
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' })
      return
    }

    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户信息失败', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
