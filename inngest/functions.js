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


import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" }, // Config
  { event: "clerk/user.created" }, // Trigger
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  }
);

// 2. Sync User Updation
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  }
);

// 3. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);

// 4. Delete Coupon on Expiry
export const deleteCouponOnExpiry = inngest.createFunction(
  { id: "delete-coupon-on-expiry" },
  { event: "app/coupon.expire" }, // API se match karne ke liye 'expire' rakha hai
  async ({ event, step }) => {
    const { data } = event;
    
    // Spelling Fix: sleepUntil (not sleepUntill)
    await step.sleepUntil("wait-for-expiry", data.expires_at);

    await step.run("delete-coupon-from-database", async () => {
      // Logic handle karain agar coupon pehle hi manually delete ho chuka ho
      try {
        await prisma.coupon.delete({
          where: { code: data.code },
        });
      } catch (error) {
        console.log("Coupon already deleted or not found");
      }
    });
  }
);