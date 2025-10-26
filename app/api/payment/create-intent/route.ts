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

    // Helper function to convert metadata values to strings
    const normalizeMetadata = (meta: Record<string, any>): Record<string, string> => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(meta)) {
        if (typeof value === 'string') {
          normalized[key] = value;
        } else if (value !== null && value !== undefined) {
          // Convert objects, arrays, etc. to JSON strings
          normalized[key] = JSON.stringify(value);
        }
      }
      return normalized;
    };

    // Create PaymentIntent with normalized metadata
    const result = await createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      customerEmail: userEmail,
      metadata: {
        flowType,
        ...normalizeMetadata(metadata || {}),
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