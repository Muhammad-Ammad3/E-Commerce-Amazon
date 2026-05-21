// import { prisma } from "@/lib/prisma";
// import authSeller from "@/middelwares/authSeller";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";



// //auth seller
// export async function GET(request) {
//     try {
//         const {userId} = getAuth(request);

//         const isSeller = await authSeller(userId);
//         if (!isSeller) {
//             return NextResponse.json({error: "usauthorized"}, {status: 401});
//         }

//         const storeInfo = await prisma.store.findUnique({
//             where: {userId: userId},
//         });
//         return NextResponse.json({isSeller, storeInfo});


//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({error: error.message || error.code}, {status: 400});
//     }
// }

import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // ✅ Clerk User
    const { userId } = getAuth(request);

    // ❌ User not logged in
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          hasStore: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ✅ Check seller
    const isSeller = await authSeller(userId);

    // ❌ User is not seller
    if (!isSeller) {
      return NextResponse.json({
        success: true,
        hasStore: false,
        storeInfo: null,
      });
    }

    // ✅ Find Store
    const storeInfo = await prisma.store.findUnique({
      where: {
        userId: userId,
      },
    });

    // ❌ Store not found
    if (!storeInfo) {
      return NextResponse.json({
        success: true,
        hasStore: false,
        storeInfo: null,
      });
    }

    // ✅ Store exists
    return NextResponse.json({
      success: true,
      hasStore: true,
      storeInfo,
    });
  } catch (error) {
    console.error("Store API Error:", error);

    return NextResponse.json(
      {
        success: false,
        hasStore: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}