// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// //Add new ratings
// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     const { orderId, productId, rating, review } = await request.json();
//     const order = await prisma.order.findUnique({
//       where: { id: orderId, userId },
//     });

//     if (!order) {
//       return NextResponse.json({ message: "Order not found" }, { status: 404 });
//     }

//     const isAlreadyRated = await prisma.rating.findFirst({
//       where: { orderId, productId },
//     });

//     if (isAlreadyRated) {
//       return NextResponse.json(
//         { message: "Product already rated" },
//         { status: 400 },
//       );
//     }

//     const response = await prisma.rating.create({
//       data: {
//         userId,
//         orderId,
//         productId,
//         rating,
//         review,
//       },
//     });
//     return NextResponse.json({
//       message: "Rating added successfully",
//       rating: response,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }


// // Get the all ratings for a user
// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);

//     if(!userId){
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const ratings = await prisma.rating.findMany({
//       where: { userId },
//       include: { productId: true },
//     });

//     return NextResponse.json({ ratings });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.code || error.message },
//       { status: 400 },
//     );
//   }
// }


import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add new ratings
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, productId, rating, review } =
      await request.json();

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    const isAlreadyRated = await prisma.rating.findFirst({
      where: {
        orderId,
        productId,
        userId,
      },
    });

    if (isAlreadyRated) {
      return NextResponse.json(
        { message: "Product already rated" },
        { status: 400 }
      );
    }

    const response = await prisma.rating.create({
      data: {
        userId,
        orderId,
        productId,
        rating,
        review,
      },
    });

    return NextResponse.json({
      message: "Rating added successfully",
      rating: response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// Get all ratings for a user
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const ratings = await prisma.rating.findMany({
      where: { userId },

      include: {
        product: true,
      },
    });

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}