// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // get store info and store products

// export async function GET(request) {
//   try {
//     // get store username from query params

//     const { searchParams } = new URL(request.url);
//     const username = searchParams.get("username").toLowerCase();
//     if (!username) {
//       return NextResponse.json(
//         { error: "missing store username" },
//         { status: 400 },
//       );
//     }

//     // get store info and inStock products with ratings
//     const store = await prisma.store.findUnique({
//       where: { username, isActive: true },
//       include: { Product: { include: { rating: true } } },
//     });
//     if (!store) {
//       return NextResponse.json({ error: "store not found" }, { status: 400 });
//     }

//     return NextResponse.josn({ store });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || error.code },
//       { status: 400 },
//     );
//   }
// }
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "missing store username" },
        { status: 400 }
      );
    }

    // normalize username
    const normalizedUsername = username
      .trim()
      .replace(/\s+/g, "")
      .toLowerCase();

    const store = await prisma.store.findFirst({
      where: {
        username: normalizedUsername,
        isActive: true,
      },
      include: {
        Product: {
          include: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "store not found" },
        { status: 404 }
      );
    }

    // frontend friendly response
    const formattedStore = {
      ...store,
      products: store.Product,
    };

    return NextResponse.json({
      store: formattedStore,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "internal server error" },
      { status: 500 }
    );
  }
}