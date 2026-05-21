import { prisma } from "@/lib/prisma";

const authSeller = async (userId) => {
  try {
    if (!userId) return null;

    const store = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    if (!store) {
      return null;
    }

    return store.id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default authSeller;
