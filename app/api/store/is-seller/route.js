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
        // 1. Get userId from Clerk
        const { userId } = getAuth(request);

        // Check if userId exists (Unauthorized check)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate if the user is a seller
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ error: "Forbidden: Not a seller" }, { status: 403 });
        }

        // 3. Fetch Store Info
        // Note: findUnique tabhi kaam karega agar 'userId' Prisma schema mein @unique marked hai
        const storeInfo = await prisma.store.findUnique({
            where: { userId: userId },
            // include: { products: true } // Agar aapko products bhi chahiye to ye add karein
        });

        if (!storeInfo) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json({ isSeller, storeInfo });

    } catch (error) {
        console.error("Seller Auth API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}