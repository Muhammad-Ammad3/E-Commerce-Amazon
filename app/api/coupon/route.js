import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const code = body?.code?.trim()?.toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          error: "Coupon code is required",
        },
        {
          status: 400,
        },
      );
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,

        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          error: "Coupon not found or expired",
        },
        {
          status: 404,
        },
      );
    }

    if (coupon.forNewUser) {
      const orderCount = await prisma.order.count({
        where: {
          userId,
        },
      });

      if (orderCount > 0) {
        return NextResponse.json(
          {
            error: "Coupon valid for new users only",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (coupon.forMember) {
      const hasPlusPlan = has?.({
        plan: "plus",
      });

      if (!hasPlusPlan) {
        return NextResponse.json(
          {
            error: "Coupon valid for members only",
          },
          {
            status: 400,
          },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        coupon,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("VERIFY COUPON ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
