import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();

    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        {
          error: "Missing stripe signature",
        },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!sessions.data || sessions.data.length === 0) {

        return;
      }

      const session = sessions.data[0];

      if (!session.metadata) {
        return;
      }

      const { orderIds, userId, appId } = session.metadata;

      if (appId !== "gocart") {
 
        return;
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },

              data: {
                isPaid: true,
              },
            });
          }),
        );

        // Clear cart
        await prisma.user.update({
          where: { id: userId },

          data: {
            cart: {},
          },
        });
      } else {
        // Delete failed orders
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: { id: orderId },
            });
          }),
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntent(event.data.object.id, true);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntent(event.data.object.id, false);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Webhook Error",
      },
      { status: 400 },
    );
  }
}
