import imagekit from "@/configs/imagekit";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add a new product to the store
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category")?.toString();
    const images = formData.getAll("images");

    // Validation Fix: NaN check and empty string check
    if (
      !name || 
      !description || 
      isNaN(mrp) || 
      isNaN(price) || 
      !category || 
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid product details" },
        { status: 400 }
      );
    }

    // Upload images to ImageKit
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        // Fix: ImageKit needs a Buffer, not an ArrayBuffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const response = await imagekit.upload({
          file: buffer, // Passing the buffer
          fileName: image.name || "product_image",
          folder: "products",
        });

        // Optimization: ImageKit URL generation
        return imagekit.url({
          path: response.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
      })
    );

    // Save to Database
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json(
      { message: "Product added successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 } // General server error 500 better rehta hai
    );
  }
}

// Get all the products of the seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' } // Optional: Naya product pehle dikhega
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}