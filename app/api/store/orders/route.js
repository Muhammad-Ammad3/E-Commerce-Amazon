import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



// update seller order status
export async function POST(request){
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)
        if(!storeId){
            return NextResponse.json({error: "unauthorized"}, {status: 401})
        }

        const {orderId, status} = await request.json()
        await prisma.order.update({
            where: {id: orderId, storeId},
            data: {status}
        })
        return NextResponse.josn({message: "Order status updated"})

    } catch (error) {
        console.error(error)
        return NextResponse.josn({error: error.code || error.message}, {status: 400})
    }
}