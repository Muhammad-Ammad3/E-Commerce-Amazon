

// const authSeller = async (userId) => {
//     try {
//         const user = await prisma.user.findUnique({
//             where: {
//                 id: userId,
//             },
//             include: {store: true,
//             },
//         });
//         if(user.store){
//             if(user.store.status === "approved"){
//                 return user.store.id;
//             }
//         }else{
//             return false
//         }
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// }


// export default authSeller;
import { prisma } from "@/lib/prisma";

const authSeller = async (userId) => {
  try {
    if (!userId) return null;

    const store = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    // ❌ No Store
    if (!store) {
      return null;
    }

    // ✅ Return Store ID
    return store.id;

  } catch (error) {
    console.log(error);
    return null;
  }
};

export default authSeller;