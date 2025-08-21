import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/utils/user';
import { ChatSDKError } from '@/lib/errors';
import { CheckoutSessionRequest } from '@/lib/stripe/stripe-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }

    const body: CheckoutSessionRequest = await request.json();
    const { lookup_key, success_path, cancel_path, payer_type, company_id } = body;

    if (!lookup_key || !payer_type) {
      return new ChatSDKError('bad_request:api').toResponse();
    }

    if (payer_type === "company" && !company_id) {
      return NextResponse.json(
        { error: 'company_id is required when payer_type is company' },
        { status: 400 }
      );
    }

    // Get the price using the lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: 'Price not found for the given lookup key' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Create or get customer first
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: session.user.email!,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: session.user.email!,
          name: session.user.name || undefined,
          metadata: {
            user_id: session.user.id,
            payer_type: payer_type,
            company_id: company_id || '',
          },
        });
      }
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer: customer.id,
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}${success_path}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancel_path}?canceled=true`,
      metadata: {
        user_id: session.user.id,
        payer_type: payer_type,
        company_id: company_id || '',
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          payer_type: payer_type,
          company_id: company_id || '',
        },
      },
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      session_id: checkoutSession.id 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
