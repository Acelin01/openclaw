import { Router, Response } from 'express'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js'
import multer from 'multer'
import { put } from '@vercel/blob'
import { prisma } from '../lib/db/index.js'
import { DatabaseService } from '../lib/db/service.js'

const router: Router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/image', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ success: false, message: '缺少文件' })
      return
    }
    const token = process.env['BLOB_READ_WRITE_TOKEN'] || ''
    if (!token) {
      res.status(500).json({ success: false, message: '缺少 BLOB_READ_WRITE_TOKEN' })
      return
    }
    const key = `uploads/${Date.now()}-${file.originalname}`
    const { url } = await put(key, file.buffer, { access: 'public', token })
    res.json({ success: true, data: { url, key } })
  } catch (error) {
    res.status(500).json({ success: false, message: '上传失败' })
  }
})

router.post('/service/:id/cover', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const file = req.file
    if (!id || !file) {
      res.status(400).json({ success: false, message: '缺少参数或文件' })
      return
    }
    const token = process.env['BLOB_READ_WRITE_TOKEN'] || ''
    if (!token) {
      res.status(500).json({ success: false, message: '缺少 BLOB_READ_WRITE_TOKEN' })
      return
    }
    const key = `service-covers/${id}-${Date.now()}-${file.originalname}`
    const { url } = await put(key, file.buffer, { access: 'public', token })

    if (prisma) {
      await prisma.workerService.update({ where: { id }, data: { coverImageUrl: url } })
    } else {
      const db = DatabaseService.getInstance()
      const srv = await db.getQuotationById(id)
      if (srv) await (db as any).updateQuotation(id, { coverImageUrl: url })
    }

    res.json({ success: true, data: { serviceId: id, coverImageUrl: url } })
  } catch (error) {
    res.status(500).json({ success: false, message: '更新封面失败' })
  }
})

export default router

