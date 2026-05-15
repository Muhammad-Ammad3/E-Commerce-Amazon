// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";
// import { store } from "next/dist/build/output/store";
// import { acceptLanguage } from "next/dist/server/accept-header";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { userId, has } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json({ error: "unauthirized" }, { status: 401 });
//     }
//     const { addressId, items, couponCode, paymentMethod } =
//       await request.json();

//     //Check if all required fields are present
//     if (
//       !addressId ||
//       !paymentMethod ||
//       !items ||
//       !Array.isArray(items) ||
//       items.length === 0
//     ) {
//       return NextResponse.json(
//         { error: "missing order details." },
//         { status: 401 },
//       );
//     }
//     let coupon = null;

//     if (couponCode) {
//       coupon = await prisma.coupon.findFirst({
//         where: {
//           code: couponCode,
//         },
//       });
//       if (!coupon) {
//         return NextResponse.json(
//           { error: "Coupon not found" },
//           { status: 404 },
//         );
//       }
//     }

//     // Check if coupon is applicable for new users
//     if (couponCode && coupon.forNewUser) {
//       const orderCount = await prisma.order.count({ where: { userId } });
//       if (orderCount > 0) {
//         return NextResponse.json(
//           { error: "This coupon is only for first-time orders" },
//           { status: 400 },
//         );
//       }
//     }

//     const hasPlusPlan = has({ plan: "plus" });
//     // Check if coupon is applicable for members

//     if (couponCode && coupon.forMember) {
//       if (!hasPlusPlan) {
//         return NextResponse.json(
//           { error: "This coupon requires a Plus membership" },
//           { status: 400 },
//         );
//       }
//     }
//     // Group orders by storeId using Map
//     const ordersByStore = new Map();
//     for (const item of items) {
//       const product = await prisma.product.findUnique({
//         where: { id: item.id },
//       });
//       const storeId = product.storeId;
//       if (!ordersByStore.has(storeId)) {
//         ordersByStore.set(storeId, []);
//       }
//       ordersByStore.get(storeId).push({ ...item, price: product.price });
//     }
//     let orderIds = [];
//     let fullAmount = 0;
//     let isShippingFeeAdded = false;

//     //Create orders for each seller
//     for (const [storeId, sellerItems] of ordersByStore.entries()) {
//       let token = sellerItems.reduce(
//         (acc, item) => acc + item.price * item.quantity,
//         0,
//       );

//       if (couponCode) {
//         total -= (total * coupon.discount) / 100;
//       }

//       if (!isPlusMember && isShippingFeeAdded) {
//         total += 5;
//         isShippingFeeAdded = true;
//       }

//       fullAmount += parseFloat(total.toFixed(2));

//       const order = await prisma.order.create({
//         data: {
//           userId,
//           storeId,
//           addressId,
//           total: parseFloat(total.toFixed(2)),
//           paymentMethod,
//           isCouponUsed: coupon ? true : false,
//           coupon: coupon ? coupon : {},
//           orderItems: {
//             create: sellerItems.map((item) => ({
//               productId: item.id,
//               quantity: item.quantity,
//               price: item.price,
//             })),
//           },
//         },
//       });
//       orderIds.push(order.id);
//     }
//     // Clear the cart
//     await prisma.user.update({
//       where: { id: userId },
//       data: { cart: {} },
//     });

//     return NextResponse.json({ message: "Orders Placed Successfully" });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }

// // Get all orders for a user
// export async function GET(request) {
//   try {
//     const { userId, has } = getAuth(request);
//     const orders = await prisma.order.findMany({
//       where: {
//         userId,
//         OR: [
//           { paymentMethod: paymentMethod.COD },
//           { AND: [{ paymentMethod: paymentMethod.STRIPE }, { isPaid: true }] },
//         ],
//       },
//       include: {
//         orderItems: { include: { product: true } },
//         address: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return (NextResponse, json({ orders }));
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }

import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      addressId,
      items,
      couponCode,
      paymentMethod: payMethod,
    } = await request.json();

    // Validate fields
    if (
      !addressId ||
      !payMethod ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing order details" },
        { status: 400 },
      );
    }

    let coupon = null;

    // Find coupon
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
        },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 },
        );
      }
    }

    // First order coupon check
    if (couponCode && coupon?.forNewUser) {
      const orderCount = await prisma.order.count({
        where: { userId },
      });

      if (orderCount > 0) {
        return NextResponse.json(
          {
            error: "This coupon is only for first-time users",
          },
          { status: 400 },
        );
      }
    }

    // Membership coupon check
    const hasPlusPlan = has({ plan: "plus" });

    if (couponCode && coupon?.forMember) {
      if (!hasPlusPlan) {
        return NextResponse.json(
          {
            error: "This coupon requires Plus membership",
          },
          { status: 400 },
        );
      }
    }

    // Group items by store
    const ordersByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const storeId = product.storeId;

      if (!ordersByStore.has(storeId)) {
        ordersByStore.set(storeId, []);
      }

      ordersByStore.get(storeId).push({
        ...item,
        price: product.price,
      });
    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // Create Orders
    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      // Apply coupon
      if (couponCode && coupon) {
        total -= (total * coupon.discount) / 100;
      }

      // Shipping fee
      if (!hasPlusPlan && !isShippingFeeAdded) {
        total += 5;
        isShippingFeeAdded = true;
      }

      total = parseFloat(total.toFixed(2));

      fullAmount += total;

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total,
          paymentMethod: payMethod,
          isCouponUsed: !!coupon,

          coupon: coupon
            ? {
                code: coupon.code,
                discount: coupon.discount,
              }
            : null,

          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      orderIds.push(order.id);
    }

    // Stripe Payment
    if (payMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const origin = request.headers.get("origin");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency: "usd",

              product_data: {
                name: "Order Payment",
              },

              unit_amount: Math.round(fullAmount * 100),
            },

            quantity: 1,
          },
        ],

        mode: "payment",

        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

        success_url: `${origin}/orders`,

        cancel_url: `${origin}/cart`,

        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "gocart",
        },
      });

      return NextResponse.json({
        session,
      });
    }

    // Clear cart
    await prisma.user.update({
      where: { id: userId },

      data: {
        cart: {},
      },
    });

    return NextResponse.json({
      message: "Orders placed successfully",
      orderIds,
      fullAmount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// GET Orders
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,

        OR: [
          {
            paymentMethod: PaymentMethod.COD,
          },

          {
            AND: [
              {
                paymentMethod: PaymentMethod.STRIPE,
              },

              {
                isPaid: true,
              },
            ],
          },
        ],
      },

      include: {
        orderItems: {
          include: {
            product: true,
          },
        },

        address: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
