import express, { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Get user wallet
router.get('/wallet', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wallet = await db.getWallet(userId);
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get wallet transactions
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wallet = await db.getWallet(userId);
    if (!wallet) {
      res.status(404).json({ success: false, message: 'Wallet not found' });
      return;
    }

    const page = parseInt(String(req.query['page'])) || 1;
    const limit = parseInt(String(req.query['limit'])) || 20;
    const skip = (page - 1) * limit;
    const type = req.query['type'] as string;

    const transactions = await db.getWalletTransactions(wallet.id, { skip, take: limit, type });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get invoices
router.get('/invoices', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const page = parseInt(String(req.query['page'])) || 1;
    const limit = parseInt(String(req.query['limit'])) || 20;
    const skip = (page - 1) * limit;
    const status = req.query['status'] as string;

    const invoices = await db.getInvoices(userId, { skip, take: limit, status });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get tax records
router.get('/tax-records', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const page = parseInt(String(req.query['page'])) || 1;
    const limit = parseInt(String(req.query['limit'])) || 20;
    const skip = (page - 1) * limit;
    const year = req.query['year'] ? parseInt(String(req.query['year'])) : undefined;

    const records = await db.getTaxRecords(userId, { skip, take: limit, year });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tax records', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
