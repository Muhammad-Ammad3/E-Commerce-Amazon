// import { getAuth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // Verify coupon
// export async function POST(request) {
//   try {
//     const { userId, has } = getAuth(request);

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { code } = await request.json();

//     if (!code) {
//       return NextResponse.json(
//         { error: "Coupon code is required" },
//         { status: 400 }
//       );
//     }

//     // Find valid coupon
//     const coupon = await prisma.coupon.findFirst({
//       where: {
//         code: code.toUpperCase(),

//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//     });

//     // Coupon not found
//     if (!coupon) {
//       return NextResponse.json(
//         { error: "Coupon not found or expired" },
//         { status: 404 }
//       );
//     }

//     // New user coupon check
//     if (coupon.forNewUser) {
//       const userOrders = await prisma.order.findMany({
//         where: { userId },
//       });

//       if (userOrders.length > 0) {
//         return NextResponse.json(
//           { error: "Coupon valid for new users only" },
//           { status: 400 }
//         );
//       }
//     }

//     // Member coupon check
//     if (coupon.forMember) {
//       const hasPlusPlan = has({ plan: "plus" });

//       if (!hasPlusPlan) {
//         return NextResponse.json(
//           { error: "Coupon valid for members only" },
//           { status: 400 }
//         );
//       }
//     }

//     return NextResponse.json({ coupon });

//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         error: error.message || error.code,
//       },
//       { status: 500 }
//     );
//   }
// }


// app/api/coupon/verify/route.js

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Verify Coupon
export async function POST(request) {
  try {

    // Clerk Auth
    const { userId, has } = await auth();

    // Unauthorized
    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Request Body
    const body = await request.json();

    const code = body?.code?.trim()?.toUpperCase();

    // Validate Coupon Code
    if (!code) {
      return NextResponse.json(
        {
          error: "Coupon code is required",
        },
        {
          status: 400,
        }
      );
    }

    // Find Coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        code,

        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Coupon Not Found
    if (!coupon) {
      return NextResponse.json(
        {
          error: "Coupon not found or expired",
        },
        {
          status: 404,
        }
      );
    }

    // New User Coupon Check
    if (coupon.forNewUser) {

      // Faster than findMany()
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
          }
        );
      }
    }

    // Member Coupon Check
    if (coupon.forMember) {

      // Clerk Plan Check
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
          }
        );
      }
    }

    // Success
    return NextResponse.json(
      {
        success: true,
        coupon,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("VERIFY COUPON ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}