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

// Get dashboard data for seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Saare data ko parallel mein fetch karte hain performance ke liye
    const [orders, products] = await Promise.all([
      prisma.order.findMany({ where: { storeId } }),
      prisma.product.findMany({ where: { storeId } }),
    ]);

    // Product IDs ki array nikalte hain ratings fetch karne ke liye
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
        orderBy: { createdAt: 'desc' } // Taaki latest reviews pehle dikhen
      });
    }

    const dashBoardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + (order.amount || order.total || 0), 0)
      ),
      totalProducts: products.length,
    };

    return NextResponse.json({ dashBoardData });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}