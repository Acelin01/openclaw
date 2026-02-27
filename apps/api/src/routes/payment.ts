import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRoles, rateLimit } from '../middleware/auth.js';
import PaymentService from '../services/payment.js';
import Stripe from 'stripe';
 

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

const router: Router = Router();

// Create payment intent for a service
router.post('/create-payment-intent', authenticateToken, rateLimit({ windowMs: 60 * 60 * 1000, max: 20, keyGenerator: (r: any) => r.user?.id || r.ip }), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, serviceId } = req.body;
    const user = req.user;

    if (!amount || !currency || !serviceId) {
      return res.status(400).json({ 
        error: 'Amount, currency, and serviceId are required' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }

    const result = await PaymentService.createPaymentIntent({
      amount,
      currency,
      serviceId,
      customerEmail: user.email,
      customerName: user.name || user.email
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Create subscription for a service
router.post('/create-subscription', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { priceId, serviceId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }

    if (!priceId || !serviceId) {
      return res.status(400).json({ 
        error: 'PriceId and serviceId are required' 
      });
    }

    const result = await PaymentService.createSubscription({
      priceId,
      serviceId,
      customerEmail: user.email,
      customerName: user.name || user.email
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, rateLimit({ windowMs: 60 * 60 * 1000, max: 40, keyGenerator: (r: any) => r.user?.id || r.ip }), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'PaymentIntentId is required' 
      });
    }

    const result = await PaymentService.confirmPayment(paymentIntentId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Process refund
router.post('/refund', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'PaymentIntentId is required' 
      });
    }

    const result = await PaymentService.refundPayment(paymentIntentId, amount);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Get payment history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }
    
    const history = await PaymentService.getPaymentHistory(user.email);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Create setup intent for saving payment methods
router.post('/create-setup-intent', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }
    
    const result = await PaymentService.createSetupIntent(user.email);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Get user's orders
router.get('/orders', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }
    
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {
      customerEmail: user.email
    };

    if (status) {
      where.status = status;
    }

    const orders: any[] = [];
    const total = 0;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Get specific order details
router.get('/orders/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }

    const order = null;

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
  return;
});

// Webhook endpoint for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  if (!sig || !webhookSecret) {
    return res.status(400).json({ 
      error: 'Missing signature or webhook secret' 
    });
  }

  let event: Stripe.Event;

  try {
    event = (Stripe as any).webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    return res.status(400).json({ 
      error: 'Webhook signature verification failed' 
    });
  }

  try {
    await PaymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed' 
    });
  }
  return;
});

export default router;
