import Stripe from 'stripe';
 

class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

let stripe: Stripe | null = null;

if (process.env['STRIPE_SECRET_KEY']) {
  stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
    apiVersion: '2022-11-15',
  });
}

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  serviceId: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionData {
  priceId: string;
  customerEmail: string;
  customerName: string;
  serviceId: string;
  metadata?: Record<string, string>;
}

export class PaymentService {
  static async createPaymentIntent(data: CreatePaymentIntentData) {
    try {
      if (data.amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      // Create or get customer
      let customer = stripe ? await this.findCustomerByEmail(data.customerEmail) : null;
      if (!customer && stripe) {
        customer = await stripe.customers.create({
          email: data.customerEmail,
          name: data.customerName,
        });
      }

      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }

      const paymentIntent = await stripe!.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: customer!.id,
        metadata: {
          serviceId: data.serviceId,
          ...data.metadata
        },
        description: `Payment for service ${data.serviceId}`,
      });
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  static async createSubscription(data: CreateSubscriptionData) {
    try {
      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }

      // Create or get customer
      let customer = await this.findCustomerByEmail(data.customerEmail);
      if (!customer && stripe) {
        customer = await stripe.customers.create({
          email: data.customerEmail,
          name: data.customerName,
        });
      }

      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer!.id,
        items: [{ price: data.priceId }],
        metadata: {
          serviceId: data.serviceId,
          ...data.metadata
        }
      });
      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create subscription', 500);
    }
  }

  static async confirmPayment(paymentIntentId: string) {
    try {
      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return { success: true, status: 'succeeded' };
      }

      return { success: false, status: paymentIntent.status };
    } catch (error) {
      throw new AppError('Failed to confirm payment', 500);
    }
  }

  static async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }
      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      throw new AppError('Failed to process refund', 500);
    }
  }

  static async getPaymentHistory(customerEmail: string) {
    try {
      const customer = await this.findCustomerByEmail(customerEmail);
      if (!customer) {
        return [];
      }

      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }

      const paymentIntents = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 100,
      });

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100,
      });

      return {
        payments: paymentIntents.data,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      throw new AppError('Failed to retrieve payment history', 500);
    }
  }

  static async createSetupIntent(customerEmail: string) {
    try {
      let customer = await this.findCustomerByEmail(customerEmail);
      if (!customer && stripe) {
        customer = await stripe.customers.create({
          email: customerEmail,
        });
      }

      if (!stripe) {
        throw new AppError('Payment service not available', 503);
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customer!.id,
        usage: 'off_session',
      });

      return {
        clientSecret: setupIntent.client_secret,
        customerId: customer!.id
      };
    } catch (error) {
      throw new AppError('Failed to create setup intent', 500);
    }
  }

  private static async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    if (!stripe) {
      return null;
    }
    try {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });
      return customers.data[0] || null;
    } catch {
      return null;
    }
  }

  static async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.confirmPayment(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            // Handle subscription payment
            await this.handleSubscriptionPayment(invoice);
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  private static async handleSubscriptionPayment(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    try {
      return;
    } catch (error) {
      console.error('Subscription payment handling error:', error);
    }
  }
}

export default PaymentService;
