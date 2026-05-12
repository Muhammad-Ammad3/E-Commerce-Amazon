// import { getAuth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // verify coupon
// export async function POST(request) {
//   try {
//     const { userId, has } = getAuth(request);
//     const { code } = await request.json();
//     const coupon = await prisma.coupon.findUnique({
//       where: { code: code.toUpperCase(), expiresAt: { gt: new Date() } },
//     });

//     if (!coupon) {
//       return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
//     }
//     if (coupon.forNewUser) {
//       const userorders = await prisma.order.findMany({ where: { userId } });
//       if (userorders.length > 0) {
//         return NextResponse.json(
//           { error: "Coupon valid for new users" },
//           { status: 400 },
//         );
//       }
//     }
//     if(coupon.forMember){
//       const hasPlusPlan = has({plan: "plus"})
//       if(!hasPlusPlan){
//         return NextResponse.json(
//           { error: "Coupon valid for members only" },
//           { status: 400 },
//         );
//       }
//     }
//     return NextResponse.json({coupon})
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: error.message || error.code }, { status: 400 });
//   }
// }



import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    // 1. Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // 2. findFirst use karein agar multiple conditions hain
    const coupon = await prisma.coupon.findFirst({
      where: { 
        code: code.toUpperCase(), 
        expiresAt: { gt: new Date() } 
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
    }

    // 3. New User Check (Optimized with count)
    if (coupon.forNewUser) {
      const orderCount = await prisma.order.count({ where: { userId } });
      if (orderCount > 0) {
        return NextResponse.json(
          { error: "This coupon is only for first-time orders" },
          { status: 400 },
        );
      }
    }

    // 4. Member Check
    if (coupon.forMember) {
      const hasPlusPlan = has({ plan: "plus" });
      if (!hasPlusPlan) {
        return NextResponse.json(
          { error: "This coupon requires a Plus membership" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      coupon 
    });

  } catch (error) {
    console.error("Coupon Verification Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}