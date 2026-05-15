// // import { prisma } from "@/lib/prisma";
// // import authSeller from "@/middelwares/authSeller";
// // import { getAuth } from "@clerk/nextjs/server";
// // import { NextResponse } from "next/server";

// // // Update seller order status
// // export async function POST(request) {
// //   try {
// //     const { userId } = getAuth(request);
// //     const storeId = await authSeller(userId);

// //     if (!storeId) {
// //       return NextResponse.json({ error: "unauthorized" }, { status: 401 });
// //     }

// //     const { orderId, status } = await request.json();

// //     await prisma.order.update({
// //       where: { id: orderId, storeId },
// //       data: { status },
// //     });

// //     return NextResponse.json({ message: "Order status updated" }); 
// //   } catch (error) {
// //     console.error(error);
// //     return NextResponse.json(
// //       { error: error.message || "Something went wrong" }, 
// //       { status: 400 },
// //     );
// //   }
// // }

// // // Get all orders for a seller
// // // export async function GET(request) {
// // //   try {
// // //     const { userId } = getAuth(request);
// // //     const storeId = await authSeller(userId);

// // //     if (!storeId) {
// // //       return NextResponse.json({ error: "unauthorized" }, { status: 401 });
// // //     }

// // //     const orders = await prisma.order.findMany({
// // //       where: { storeId },
// // //       include: {
// // //         user: true,
// // //         address: true,
// // //         orderItems: { include: { product: true } },
// // //       },
// // //       orderBy: { createdAt: "desc" },
// // //     });

// // //     return NextResponse.json({ orders }); 
// // //   } catch (error) {
// // //     console.error(error);
// // //     return NextResponse.json(
// // //       { error: error.message || "Something went wrong" }, 
// // //       { status: 400 },
// // //     );
// // //   }
// // // }

// // export async function GET(request) {
// //   try {
// //     const { userId } = getAuth(request);
// //     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// //     const store = await prisma.store.findUnique({ where: { userId } });
// //     if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

// //     const orders = await prisma.order.findMany({
// //       where: { storeId: store.id },
// //       include: {
// //         user: { select: { name: true, email: true } },
// //         address: true,
// //         orderItems: { include: { product: true } },
// //         // coupon: true <-- Yeh delete kar diya hai kyunki yeh Json field hai
// //       },
// //       orderBy: { createdAt: "desc" },
// //     });

// //     return NextResponse.json({ orders });
// //   } catch (error) {
// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }
// // }

// import { prisma } from "@/lib/prisma";
// import authSeller from "@/middelwares/authSeller";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // Update seller order status
// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const storeId = await authSeller(userId);

//     if (!storeId) {
//       return NextResponse.json(
//         { error: "Seller not authorized" },
//         { status: 401 }
//       );
//     }

//     const { orderId, status } = await request.json();

//     if (!orderId || !status) {
//       return NextResponse.json(
//         { error: "Missing orderId or status" },
//         { status: 400 }
//       );
//     }

//     // Verify order belongs to seller
//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderId,
//         storeId,
//       },
//     });

//     if (!order) {
//       return NextResponse.json(
//         { error: "Order not found" },
//         { status: 404 }
//       );
//     }

//     // Update order
//     await prisma.order.update({
//       where: {
//         id: orderId,
//       },
//       data: {
//         status,
//       },
//     });

//     return NextResponse.json({
//       message: "Order status updated successfully",
//     });

//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         error: error.message || "Something went wrong",
//       },
//       { status: 500 }
//     );
//   }
// }

// // Get all orders for seller
// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Find seller store
//     const store = await prisma.store.findUnique({
//       where: {
//         userId,
//       },
//     });

//     if (!store) {
//       return NextResponse.json(
//         { error: "Store not found" },
//         { status: 404 }
//       );
//     }

//     // Get orders
//     const orders = await prisma.order.findMany({
//       where: {
//         storeId: store.id,
//       },

//       include: {
//         user: {
//           select: {
//             name: true,
//             email: true,
//           },
//         },

//         address: true,

//         orderItems: {
//           include: {
//             product: true,
//           },
//         },
//       },

//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({ orders });

//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         error: error.message || "Something went wrong",
//       },
//       { status: 500 }
//     );
//   }
// }


import { prisma } from "@/lib/prisma";
import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update seller order status
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "Seller not authorized" },
        { status: 401 }
      );
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    // Verify order belongs to seller
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      message: "Order status updated successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// Get all orders for seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find seller store
    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
      },

      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },

        address: true,

        orderItems: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}