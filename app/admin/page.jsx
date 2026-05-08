// 'use client'
// import { dummyAdminDashboardData } from "@/assets/assets"
// import Loading from "@/components/Loading"
// import OrdersAreaChart from "@/components/OrdersAreaChart"
// import { useAuth } from "@clerk/nextjs";
// import axios from "axios";
// import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
// import { useEffect, useState } from "react"
// import { toast } from "react-hot-toast";

// export default function AdminDashboard() {

//     const {getToken} = useAuth() 

//     const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

//     const [loading, setLoading] = useState(true)
//     const [dashboardData, setDashboardData] = useState({
//         products: 0,
//         revenue: 0,
//         orders: 0,
//         stores: 0,
//         allOrders: [],
//     })

//     const dashboardCardsData = [
//         { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
//         { title: 'Total Revenue', value: currency + dashboardData.revenue, icon: CircleDollarSignIcon },
//         { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
//         { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
//     ]

//     const fetchDashboardData = async () => {
//         try {
//             const token = await getToken()
//             const {data} = await axios.get("/api/admin/dashboard", {
//                 headers: {Authorization: `Bearer ${token}`}
//             })
//             setDashboardData(data.dashboardData)
//         } catch (error) {
//             toast.error(error?.response?.data?.error || error.message)
//         }
//         setLoading(false)
//     }

//     useEffect(() => {
//         fetchDashboardData()
//     }, [])

//     if (loading) return <Loading />

//     return (
//         <div className="text-slate-500">
//             <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

//             {/* Cards */}
//             <div className="flex flex-wrap gap-5 my-10 mt-4">
//                 {
//                     dashboardCardsData.map((card, index) => (
//                         <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
//                             <div className="flex flex-col gap-3 text-xs">
//                                 <p>{card.title}</p>
//                                 <b className="text-2xl font-medium text-slate-700">{card.value}</b>
//                             </div>
//                             <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
//                         </div>
//                     ))
//                 }
//             </div>

//             {/* Area Chart */}
//             <OrdersAreaChart allOrders={dashboardData.allOrders} />
//         </div>
//     )
// }

'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { toast } from "react-hot-toast";

export default function AdminDashboard() {

    const { getToken } = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    // API se data fetch karne ka function
    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await axios.get("/api/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Backend mein 'dashBoardData' (B capital) hai, isliye wahi use karein
            if (data.dashBoardData) {
                setDashboardData(data.dashBoardData)
            }
            
        } catch (error) {
            console.error("Fetch Error:", error)
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // useMemo use karne se data update hone par cards automatically update honge
    const dashboardCardsData = useMemo(() => [
        { title: 'Total Products', value: dashboardData?.products || 0, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + (dashboardData?.revenue || 0), icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData?.orders || 0, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData?.stores || 0, icon: StoreIcon },
    ], [dashboardData, currency]);

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards Section */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg min-w-[200px]">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart Section */}
            {dashboardData.allOrders && (
                <OrdersAreaChart allOrders={dashboardData.allOrders} />
            )}
        </div>
    )
}