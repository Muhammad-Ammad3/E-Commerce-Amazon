import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



//auth seller
export async function GET(request) {
    try {
        const {userId} = getAuth(request);

        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({error: "usauthorized"}, {status: 401});
        }

        const storeInfo = await prisma.store.findUnique({
            where: {userId: userId},
        });
        return NextResponse.json({isSeller, storeInfo});


    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || error.code}, {status: 400});
    }
}