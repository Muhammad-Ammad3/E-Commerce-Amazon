
// toogle stock of a product

import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "missing product id" },
        { status: 400 },
      );
    }

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if the product belongs to the store
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId: storeId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock },
    });
    return NextResponse.json({ message: "Product stock updated successfully" });


  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || error.code },
      { status: 400 },
    );
  }
}
