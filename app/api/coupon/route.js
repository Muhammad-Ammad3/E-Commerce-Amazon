import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// verify coupon
export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);
    const { code } = await request.json();
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), expiresAt: { gt: new Date() } },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    if (coupon.forNewUser) {
      const userorders = await prisma.order.findMany({ where: { userId } });
      if (userorders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 },
        );
      }
    }
  } catch (error) {}
}
