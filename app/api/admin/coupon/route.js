// import { prisma } from "@/lib/prisma";
// import authAdmin from "@/middelwares/authAdmin";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // add new coupon
// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     const isAdmin = await authAdmin(userId);

//     if (!isAdmin) {
//       return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//     }

//     const coupon = await request.json();
//     coupon.code = coupon.code.toUpperCase();

//     await prisma.coupon.create({ data: coupon });

//     return NextResponse.json({ message: "Coupen added successfully" });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }

// // delete coupon  /api/coupon?id=couponId
// export async function DELETE(request) {
//   try {
//     const { userId } = getAuth(request);
//     const isAdmin = await authAdmin(userId);

//     if (!isAdmin) {
//       return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = request.nextUrl;
//     const code = searchParams.get("code");

//     await prisma.coupon.delete({ where: { code } });
//     return NextResponse.json({ message: "Coupen deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }

// // get all coupons
// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     const isAdmin = await authAdmin(userId);

//     if (!isAdmin) {
//       return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//     }

//     const coupons = await prisma.coupon.findMany({});
//     return NextResponse.json({ coupons });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }

import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import authAdmin from "@/middelwares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET: Tamam coupons mangwane ke liye
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Naya coupon add karne ke liye
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // 1. Pehle coupon create karein aur variable mein save karein
    const coupon = await prisma.coupon.create({
      data: {
        ...body,
        code: body.code.toUpperCase(),
        discount: Number(body.discount),
        expiresAt: new Date(body.expiresAt),
      },
    });

    // 2. Inngest event bhejain (await zaroori hai taake confirm ho jaye)
    await inngest.send({
      name: "app/coupon.expire",
      data: {
        code: coupon.code,
        expires_at: coupon.expiresAt,
      },
    });

    return NextResponse.json({ message: "Coupon added successfully", coupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: Coupon khatam karne ke liye
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { code: code.toUpperCase() },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}