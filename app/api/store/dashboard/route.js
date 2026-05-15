// import { prisma } from "@/lib/prisma";
// import authSeller from "@/middelwares/authSeller";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // get  dashboard data for seller (total orders, totals earnings, total products)

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     const storeId = await authSeller(userId);

//     // get all orders for sellers
//     const orders = await prisma.order.findMany({ where: { storeId } });

//     // get all products ratings for seller
//     const products = await prisma.product.findMany({ where: { storeId } });

//     const ratings = await prisma.rating.findMany({
//       where: { productId: { in: product.map((product) => product.id) } },
//       include: { user: true, product: true },
//     });

//     const dashBoardData = {
//       ratings,
//       totalOrders: orders.length,
//       totalEarnings: Math.round(
//         orders.reduce((acc, order) => acc + order.total, 0),
//       ),
//       totalProducts: products.length,
//     };

//     return NextResponse.json({ dashBoardData });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || error.code },
//       { status: 400 },
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    // 1. Check if user is logged in
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 2. AuthSeller check
    // Ensure authSeller returns storeId or null, and doesn't throw unhandled error
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Seller store not found" }, { status: 401 });
    }

    // 3. Parallel fetching with error handling for database
    const [orders, products] = await Promise.all([
      prisma.order.findMany({ 
        where: { storeId: storeId } 
      }),
      prisma.product.findMany({ 
        where: { storeId: storeId } 
      }),
    ]);

    const productIds = products.map((p) => p.id);

    let ratings = [];
    if (productIds.length > 0) {
      ratings = await prisma.rating.findMany({
        where: { 
          productId: { in: productIds } 
        },
        include: { 
          user: true, 
          product: true 
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // 4. Safe calculation (Fixing potential 500 error)
    const totalEarnings = orders.reduce((acc, order) => {
      // Jo field aapke DB mein hai (amount ya total), use yahan check karein
      const value = Number(order.amount || order.total || 0);
      return acc + value;
    }, 0);

    const dashBoardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(totalEarnings),
      totalProducts: products.length,
    };

    return NextResponse.json({ dashBoardData });

  } catch (error) {
    // Isse terminal mein check karein ke asli error kya hai
    console.error("Critical Dashboard Error:", error); 
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}