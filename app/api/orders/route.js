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

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } =
      await request.json();

    if (
      !addressId ||
      !paymentMethod ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 },
      );
    }

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, expiresAt: { gt: new Date() } },
      });
      if (!coupon) {
        return NextResponse.json({ error: "Invalid Coupon" }, { status: 404 });
      }
    }

    // Performance Fix: Saare products ek saath fetch karein
    const productIds = items.map((i) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const ordersByStore = new Map();
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.id);
      if (!product) continue;

      const storeId = product.storeId;
      if (!ordersByStore.has(storeId)) {
        ordersByStore.set(storeId, []);
      }
      ordersByStore.get(storeId).push({ ...item, price: product.price });
    }

    const hasPlusPlan = has({ plan: "plus" });
    let isShippingFeeAdded = false;

    // Create orders
    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let currentOrderTotal = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      if (coupon) {
        currentOrderTotal -= (currentOrderTotal * coupon.discount) / 100;
      }

      // Add shipping fee once if not a Plus member
      if (!hasPlusPlan && !isShippingFeeAdded) {
        currentOrderTotal += 5;
        isShippingFeeAdded = true;
      }

      await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(currentOrderTotal.toFixed(2)),
          paymentMethod,
          isPaid: paymentMethod === "COD" ? false : false, // Stripe ke liye true baad mein hoga
          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    }

    // Clear cart (Assuming cart is a Json field or related table)
    await prisma.user.update({
      where: { id: userId },
      data: { cart: [] },
    });

    return NextResponse.json({ message: "Orders Placed Successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: "COD" },
          { AND: [{ paymentMethod: "STRIPE" }, { isPaid: true }] },
        ],
      },
      include: {
        orderItems: { include: { product: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
