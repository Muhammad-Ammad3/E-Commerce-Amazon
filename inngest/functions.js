// // src/inngest/functions.ts
// import { prisma } from "@/lib/prisma";
// import { inngest } from "./client";

// export const syncUserCreation = inngest.createFunction(
//   {
//     id: "sync-user-create",
//     triggers: { event: "clerk/user.created" },
//   },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.create({
//       data: {
//         id: data.id,
//         email: data.email_addresses[0].email_address,
//         name: `${data.first_name} ${data.last_name}`,
//         image: data.image_url,
//       },
//     });
//   },
// );

// export const syncUserUpdation = inngest.createFunction(
//   {
//     id: "sync-user-update",
//     triggers: { event: "clerk/user.updated" },
//   },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.update({
//       where: {
//         id: data.id,
//       },
//       data: {
//         email: data.email_addresses[0].email_address,
//         name: `${data.first_name} ${data.last_name}`,
//         image: data.image_url,
//       },
//     });
//   },
// );

// export const syncUserDeletion = inngest.createFunction(
//   {
//     id: "sync-user-delete",
//     triggers: { event: "clerk/user.deleted" },
//   },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.delete({
//       where: {
//         id: data.id,
//       },
//     });
//   },
// );

// // inngest function to delete coupon on expiry
// export const deleteCouponOnExpiry = inngest.createFunction(
//   { id: "delete-coupon-on-expiry" },
//   { event: "app/coupon.expired" },
//   async ({ event, step }) => {
//     const { data } = event;
//     const expiryDate = new Date(data.expires_at);
//     await step.sleepUntill("wait-for-expiry", expiryDate);

//     await step.run("delete-coupon-from-database", async () => {
//       await prisma.coupon.delete({
//         where: { code: data.code },
//       });
//     });
//   },
// );



// src/inngest/functions.ts
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-create",
    triggers: [{ event: "clerk/user.created" }], // Array format is better
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url,
      },
    });
  }
);

export const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-update",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url,
      },
    });
  }
);

export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);

// FIX: Yahan configuration aur triggers ko merge kar diya hai
export const deleteCouponOnExpiry = inngest.createFunction(
  { 
    id: "delete-coupon-on-expiry",
    triggers: [{ event: "app/coupon.expired" }] // Trigger ab pehle argument mein hai
  },
  async ({ event, step }) => {
    const { data } = event;
    const expiryDate = new Date(data.expires_at);

    // FIX: sleepUntil (single 'l')
    await step.sleepUntil("wait-for-expiry", expiryDate);

    await step.run("delete-coupon-from-database", async () => {
      await prisma.coupon.delete({
        where: { code: data.code },
      });
    });
  }
);