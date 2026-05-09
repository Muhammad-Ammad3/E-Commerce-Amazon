import { serve } from "inngest/next";
import {
  deleteCouponOnExpiry,
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
} from "@/inngest/functions";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    deleteCouponOnExpiry,
  ],
});
