import authAdmin from "@/middelwares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// auth admin
export async function GET(request){
    try {
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error: "unauthorized"}, {status: 401})
        }

        return NextResponse.json({isAdmin})

    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}


// import authAdmin from "@/middelwares/authAdmin"; // Spelling check: middlewares?
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // /api/admin/is-admin/route.js

// export async function GET() {
//     try {
//         const { userId } = await auth(); 

//         if (!userId) {
//             console.log("No User Logged In");
//             return NextResponse.json({ isAdmin: false }, { status: 401 });
//         }

//         const isAdmin = await authAdmin(userId);
        
//         if (!isAdmin) {
//             console.log("User is NOT an admin:", userId); // Ye terminal mein check karein
//             // Agar admin nahi hai, toh status 200 hi bhejein par isAdmin: false
//             // Taaki Axios catch block mein na jaye
//             return NextResponse.json({ isAdmin: false }, { status: 200 }); 
//         }

//         return NextResponse.json({ isAdmin: true }, { status: 200 });

//     } catch (error) {
//         return NextResponse.json({ error: "Server Error" }, { status: 500 });
//     }
// }