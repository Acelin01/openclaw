import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { put } from '@vercel/blob';
import multer from 'multer';

const router: Router = Router();
const upload = multer({ 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/v1/files/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const file = req.file;
        
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
             res.status(400).json({ error: 'File type should be JPEG or PNG' });
             return;
        }

        const filename = file.originalname;
        const data = await put(filename, file.buffer, {
            access: 'public',
        });

        res.json(data);
    } catch (error: any) {
        console.error('Upload failed:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

export default router;
