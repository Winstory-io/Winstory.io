/**
 * API Route: /api/payment/create-intent
 * Creates a Stripe PaymentIntent for payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe-server';
import { dollarsToCents } from '@/lib/config/stripe-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, flowType, userEmail, metadata } = body;

    // Data validation
    if (!amount || !flowType) {
      return NextResponse.json(
        { error: 'Amount and flow type required' },
        { status: 400 }
      );
    }

    // Convert amount to cents
    const amountInCents = dollarsToCents(amount);

    // Create PaymentIntent
    const result = await createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      customerEmail: userEmail,
      metadata: {
        flowType,
        ...metadata,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Error in create-intent:', error);
    return NextResponse.json(
      { error: 'Server error during payment creation' },
      { status: 500 }
    );
  }
} 