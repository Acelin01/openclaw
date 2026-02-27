import express, { Router, Response } from 'express';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import * as sharedEmployeeDb from '../lib/db/shared-employee.js';

const router: Router = express.Router();

// Get all shared employees
router.get('/', optionalAuthenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const employees = await sharedEmployeeDb.getSharedEmployees();
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shared employees',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shared employee stats
router.get('/stats', optionalAuthenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await sharedEmployeeDb.getSharedEmployeeStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shared employee stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shared employee by ID
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await sharedEmployeeDb.getSharedEmployeeById(id!);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shared employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create shared employee
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const employee = await sharedEmployeeDb.createSharedEmployee(data);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create shared employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update shared employee
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const employee = await sharedEmployeeDb.updateSharedEmployee(id!, data);
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update shared employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete shared employee
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await sharedEmployeeDb.deleteSharedEmployee(id!);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete shared employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
