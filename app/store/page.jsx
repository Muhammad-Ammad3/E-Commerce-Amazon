"use client";


// export default function Dashboard() {
//   const { getToken } = useAuth();
//   const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState({
//     totalProducts: 0,
//     totalEarnings: 0,
//     totalOrders: 0,
//     ratings: [],
//   });

//   const dashboardCardsData = [
//     {
//       title: "Total Products",
//       value: dashboardData.totalProducts,
//       icon: ShoppingBasketIcon,
//     },
//     {
//       title: "Total Earnings",
//       value: currency + dashboardData.totalEarnings,
//       icon: CircleDollarSignIcon,
//     },
//     { title: "Total Orders", value: dashboardData.totalOrders, icon: TagsIcon },
//     {
//       title: "Total Ratings",
//       value: dashboardData.ratings.length,
//       icon: StarIcon,
//     },
//   ];

//   const fetchDashboardData = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("api/store/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setDashboardData(data.dashboardData);
//     } catch (error) {
//         toast.error(error?.response?.data?.error || error.message)
//     }
//     setLoading(false)
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   if (loading) return <Loading />;

//   return (
//     <div className=" text-slate-500 mb-28">
//       <h1 className="text-2xl">
//         Seller <span className="text-slate-800 font-medium">Dashboard</span>
//       </h1>

//       <div className="flex flex-wrap gap-5 my-10 mt-4">
//         {dashboardCardsData.map((card, index) => (
//           <div
//             key={index}
//             className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg"
//           >
//             <div className="flex flex-col gap-3 text-xs">
//               <p>{card.title}</p>
//               <b className="text-2xl font-medium text-slate-700">
//                 {card.value}
//               </b>
//             </div>
//             <card.icon
//               size={50}
//               className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
//             />
//           </div>
//         ))}
//       </div>

//       <h2>Total Reviews</h2>

//       <div className="mt-5">
//         {dashboardData.ratings.map((review, index) => (
//           <div
//             key={index}
//             className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl"
//           >
//             <div>
//               <div className="flex gap-3">
//                 <Image
//                   src={review.user.image}
//                   alt=""
//                   className="w-10 aspect-square rounded-full"
//                   width={100}
//                   height={100}
//                 />
//                 <div>
//                   <p className="font-medium">{review.user.name}</p>
//                   <p className="font-light text-slate-500">
//                     {new Date(review.createdAt).toDateString()}
//                   </p>
//                 </div>
//               </div>
//               <p className="mt-3 text-slate-500 max-w-xs leading-6">
//                 {review.review}
//               </p>
//             </div>
//             <div className="flex flex-col justify-between gap-6 sm:items-end">
//               <div className="flex flex-col sm:items-end">
//                 <p className="text-slate-400">{review.product?.category}</p>
//                 <p className="font-medium">{review.product?.name}</p>
//                 <div className="flex items-center">
//                   {Array(5)
//                     .fill("")
//                     .map((_, index) => (
//                       <StarIcon
//                         key={index}
//                         size={17}
//                         className="text-transparent mt-0.5"
//                         fill={
//                           review.rating >= index + 1 ? "#00C950" : "#D1D5DB"
//                         }
//                       />
//                     ))}
//                 </div>
//               </div>
//               <button
//                 onClick={() => router.push(`/product/${review.product.id}`)}
//                 className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all"
//               >
//                 View Product
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { dummyStoreDashboardData } from "@/assets/assets";
import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
  });

  // API Call - Path fixed with leading slash
  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/store/dashboard", { // Fixed path
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend response dashBoardData (B capital) bhej raha hai ya dashboardData? 
      // Pichle code ke hisab se ye 'dashBoardData' tha.
      setDashboardData(data.dashBoardData); 
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Is array ko fetch ke baad update hona chahiye, jo ki ho jayega kyunki component re-render hoga
  const dashboardCardsData = [
    {
      title: "Total Products",
      value: dashboardData.totalProducts,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Earnings",
      value: `${currency}${dashboardData.totalEarnings.toLocaleString()}`, // Added commas for readability
      icon: CircleDollarSignIcon,
    },
    { title: "Total Orders", value: dashboardData.totalOrders, icon: TagsIcon },
    {
      title: "Total Ratings",
      value: dashboardData.ratings.length,
      icon: StarIcon,
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Seller <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg min-w-[200px]"
          >
            <div className="flex flex-col gap-1 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">
                {card.value}
              </b>
            </div>
            <card.icon
              size={40}
              className="w-12 h-12 p-2.5 text-slate-400 bg-slate-100 rounded-full"
            />
          </div>
        ))}
      </div>

      <h2 className="text-lg font-medium text-slate-800">Total Reviews</h2>

      <div className="mt-5">
        {dashboardData.ratings.length > 0 ? (
          dashboardData.ratings.map((review, index) => (
            <div
              key={index}
              className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl"
            >
              {/* Reviewer Info */}
              <div className="flex-1">
                <div className="flex gap-3">
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="font-medium text-slate-800">{review.user.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-slate-600 italic">"{review.review}"</p>
              </div>

              {/* Product Info & Rating */}
              <div className="flex flex-col justify-between gap-4 sm:items-end">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {review.product?.category}
                  </p>
                  <p className="font-medium text-slate-700">{review.product?.name}</p>
                  <div className="flex items-center sm:justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        className={i < review.rating ? "text-green-500 fill-green-500" : "text-slate-300 fill-slate-300"}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="text-xs bg-white border border-slate-200 px-4 py-2 hover:bg-slate-50 rounded shadow-sm transition-all"
                >
                  View Product
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 py-10">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}