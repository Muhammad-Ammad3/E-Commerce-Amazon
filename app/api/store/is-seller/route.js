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
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    // ❌ User not logged in
    if (!userId) {
      return NextResponse.json({
        success: false,
        hasStore: false,
      });
    }

    // ✅ Find Store
    const store = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    // ✅ Store exists
    if (store) {
      return NextResponse.json({
        success: true,
        hasStore: true,
        storeInfo: store,
      });
    }

    // ❌ Store not exists
    return NextResponse.json({
      success: true,
      hasStore: false,
      storeInfo: null,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        hasStore: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}