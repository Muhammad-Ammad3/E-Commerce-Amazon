import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        hasStore: false,
      });
    }
    const store = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    if (store) {
      return NextResponse.json({
        success: true,
        hasStore: true,
        storeInfo: store,
      });
    }

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
      { status: 500 },
    );
  }
}
