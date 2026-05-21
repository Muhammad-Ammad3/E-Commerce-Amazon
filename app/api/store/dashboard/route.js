import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "Seller store not found" },
        { status: 401 },
      );
    }

    const [orders, products] = await Promise.all([
      prisma.order.findMany({
        where: { storeId: storeId },
      }),
      prisma.product.findMany({
        where: { storeId: storeId },
      }),
    ]);

    const productIds = products.map((p) => p.id);

    let ratings = [];
    if (productIds.length > 0) {
      ratings = await prisma.rating.findMany({
        where: {
          productId: { in: productIds },
        },
        include: {
          user: true,
          product: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const totalEarnings = orders.reduce((acc, order) => {
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
    console.error("Critical Dashboard Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
