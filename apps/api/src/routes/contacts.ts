import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/db/index.js';

const router: Router = express.Router();

// Get contacts for the current user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!prisma) {
      res.status(500).json({ 
        success: false, 
        message: 'Database not initialized',
        error: 'Prisma client is null'
      });
      return;
    }

    const contacts = await prisma.userContact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            jobTitle: true,
            phone: true,
            departmentId: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            identifier: true,
            prompt: true,
            mermaid: true,
            departmentId: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all departments with their users
router.get('/departments', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!prisma) {
        res.status(500).json({ 
          success: false, 
          message: 'Database not initialized',
          error: 'Prisma client is null'
        });
        return;
    }
    const departments = await prisma.department.findMany({
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    jobTitle: true,
                    email: true
                }
            },
            agents: {
                select: {
                    id: true,
                    name: true,
                    identifier: true,
                    prompt: true
                }
            }
        }
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
