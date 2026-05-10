import { prisma } from "@/lib/prisma";


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


const authSeller = async (userId) => {
    try {
        if (!userId) return false;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true },
        });

        // Check if user exists and has a store
        if (!user || !user.store) {
            return false;
        }

        // Logic Check: Status check ko tabhi rakhein agar aapne approval system banaya hai
        // Agar status "approved" nahi hai, toh ye false dega
        if (user.store.status === "approved") {
            return user.store.id;
        }

        // Agar store hai par approved nahi hai
        return false;

    } catch (error) {
        console.error("AuthSeller Middleware Error:", error);
        return false;
    }
}

export default authSeller;