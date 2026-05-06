import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get  dashboard data for seller (total orders, totals earnings, total products)

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    // get all orders for sellers
    const orders = await prisma.order.findMany({ where: { storeId } });

    // get all products ratings for seller
    const products = await prisma.product.findMany({ where: { storeId } });

    const ratings = await prisma.rating.findMany({
      where: { productId: { in: product.map((product) => product.id) } },
      include: { user: true, product: true },
    });

    const dashBoardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + order.total, 0),
      ),
      totalProducts: products.length,
    };

    return NextResponse.json({ dashBoardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || error.code },
      { status: 400 },
    );
  }
}
