import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import * as workerDb from '../lib/db/worker.js';

const router: Router = express.Router();

// Get all worker profiles
router.get('/profiles', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filters = req.query;
    const profiles = await workerDb.getWorkerProfiles(filters);
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker profiles',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current worker profile
router.get('/profile/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await workerDb.getWorkerProfileByUserId(userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get current worker profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker profile by user ID
router.get('/profile/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`[WorkersRoute] Getting profile for userId: ${userId}`);
    const profile = await workerDb.getWorkerProfileByUserId(userId!);
    console.log(`[WorkersRoute] Found profile: ${profile ? 'yes' : 'no'}`);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upsert current worker profile
router.post('/profile/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = req.body;
    const profile = await workerDb.upsertWorkerProfile(userId, data);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker services
router.get('/:workerId/services', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const services = await workerDb.getWorkerServices(workerId!);
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker services',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create worker service
router.post('/services', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const service = await workerDb.createWorkerService(data);
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker portfolios
router.get('/:workerId/portfolios', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const portfolios = await workerDb.getWorkerPortfolios(workerId!);
    res.json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker portfolios',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create worker portfolio
router.post('/portfolios', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const portfolio = await workerDb.createWorkerPortfolio(data);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker portfolio',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker certifications
router.get('/:workerId/certifications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const certifications = await workerDb.getWorkerSkillCertifications(workerId!);
    res.json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker certifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create worker certification
router.post('/certifications', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const certification = await workerDb.createWorkerSkillCertification(data);
    res.json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker service
router.patch('/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const service = await workerDb.updateWorkerService(id!, data);
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker experiences
router.get('/:workerId/experiences', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const experiences = await workerDb.getWorkerExperiences(workerId!);
    res.json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker experiences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create worker experience
router.post('/experiences', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const experience = await workerDb.createWorkerExperience(data);
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker experience',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get worker schedules
router.get('/:workerId/schedules', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const schedules = await workerDb.getWorkerSchedules(workerId!);
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker schedules',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create worker schedule
router.post('/schedules', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const schedule = await workerDb.createWorkerSchedule(data);
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get quotations
router.get('/quotations', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filters = req.query;
    const quotations = await workerDb.getQuotations(filters);
    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quotations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create quotation
router.post('/quotations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const quotation = await workerDb.createQuotation(data);
    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quotation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update quotation
router.patch('/quotations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const quotation = await workerDb.updateQuotation(id!, data);
    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update quotation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker service
router.delete('/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteWorkerService(id!);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker portfolio
router.patch('/portfolios/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const portfolio = await workerDb.updateWorkerPortfolio(id!, data);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker portfolio',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker portfolio
router.delete('/portfolios/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteWorkerPortfolio(id!);
    res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker portfolio',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker certification
router.patch('/certifications/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const certification = await workerDb.updateWorkerSkillCertification(id!, data);
    res.json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker certification
router.delete('/certifications/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteWorkerSkillCertification(id!);
    res.json({ success: true, message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete quotation
router.delete('/quotations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteQuotation(id!);
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quotation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get resumes
router.get('/resumes', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filters = req.query;
    const resumes = await workerDb.getResumes(filters);
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get resumes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create resume
router.post('/resumes', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const resume = await workerDb.createResume(data);
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update resume
router.patch('/resumes/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const resume = await workerDb.updateResume(id!, data);
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete resume
router.delete('/resumes/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteResume(id!);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker experience
router.patch('/experiences/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const experience = await workerDb.updateWorkerExperience(id!, data);
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker experience',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker experience
router.delete('/experiences/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteWorkerExperience(id!);
    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker experience',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker schedule
router.patch('/schedules/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const schedule = await workerDb.updateWorkerSchedule(id!, data);
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker schedule
router.delete('/schedules/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteWorkerSchedule(id!);
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transactions (orders)
router.get('/transactions', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filters = req.query;
    const transactions = await workerDb.getTransactions(filters);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create transaction
router.post('/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const transaction = await workerDb.createTransaction(data);
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update transaction
router.patch('/transactions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const transaction = await workerDb.updateTransaction(id!, data);
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete transaction
router.delete('/transactions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await workerDb.deleteTransaction(id!);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
