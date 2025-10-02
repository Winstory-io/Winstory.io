/**
 * API Route: /api/payment/webhook
 * Handles Stripe webhooks to confirm payments
 * This route is called by Stripe after each payment event
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { PrismaClient } from '@prisma/client';
import { centsToDollars } from '@/lib/config/stripe-config';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Missing webhook configuration' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles a successful payment
 */
async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const metadata = paymentIntent.metadata || {};
    
    // Create or update payment record
    await prisma.payment.upsert({
      where: { providerId: paymentIntent.id },
      update: {
        status: 'PENDING_SETTLEMENT',
        settledAt: new Date(),
      },
      create: {
        provider: 'stripe',
        providerId: paymentIntent.id,
        amount: centsToDollars(paymentIntent.amount_received),
        currency: paymentIntent.currency,
        status: 'PENDING_SETTLEMENT',
        userEmail: paymentIntent.receipt_email,
        userType: metadata.flowType,
        metadata: metadata,
        settledAt: new Date(),
      },
    });

    console.log(`Payment recorded: ${paymentIntent.id}`);
    
    // TODO: Send confirmation email
    // TODO: Trigger campaign creation logic
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

/**
 * Handles a failed payment
 */
async function handlePaymentFailed(paymentIntent: any) {
  try {
    await prisma.payment.upsert({
      where: { providerId: paymentIntent.id },
      update: {
        status: 'FAILED',
      },
      create: {
        provider: 'stripe',
        providerId: paymentIntent.id,
        amount: centsToDollars(paymentIntent.amount),
        currency: paymentIntent.currency,
        status: 'FAILED',
        metadata: paymentIntent.metadata,
      },
    });

    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // TODO: Notify user of failure
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

/**
 * Handles a refund
 */
async function handleRefund(charge: any) {
  try {
    const paymentIntentId = charge.payment_intent;
    
    await prisma.payment.updateMany({
      where: { providerId: paymentIntentId },
      data: {
        status: 'REFUNDED',
      },
    });

    console.log(`Refund processed for: ${paymentIntentId}`);
    
    // TODO: Notify user of refund
  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

// Disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}; 