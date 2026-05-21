// "use client";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import toast from "react-hot-toast";
// import { DeleteIcon } from "lucide-react";
// import { useAuth } from "@clerk/nextjs";
// import axios from "axios";

// export default function AdminCoupons() {
//   const { getToken } = useAuth();
//   const [coupons, setCoupons] = useState([]);

//   const [newCoupon, setNewCoupon] = useState({
//     code: "",
//     description: "",
//     discount: "",
//     forNewUser: false,
//     forMember: false,
//     isPublic: false,
//     expiresAt: new Date(),
//   });

//   const fetchCoupons = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/admin/coupon", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCoupons(data.coupons);
//     } catch (error) {
//       toast.error(error?.response?.data?.error || error.message);
//     }
//   };

//   const handleAddCoupon = async (e) => {
//     e.preventDefault();
//     try {
//       const token = await getToken();

//       const payload = {
//         ...newCoupon,
//         discount: Number(newCoupon.discount),
//         expiresAt: new Date(newCoupon.expiresAt),
//       };

//       const { data } = await axios.post("/api/admin/coupon", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.success(data.message);

//       setNewCoupon({
//         code: "",
//         description: "",
//         discount: "",
//         forNewUser: false,
//         forMember: false,
//         isPublic: false,
//         expiresAt: new Date(),
//       });

//       await fetchCoupons();
//     } catch (error) {
//       toast.error(error?.response?.data?.error || error.message);
//       throw error;
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNewCoupon({
//       ...newCoupon,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const deleteCoupon = async (code) => {
//     try {
//       const confirm = window.confirm(
//         "Are you sure you want to delete this coupon?",
//       );
//       if (!confirm) return;

//       const token = await getToken();

//       await axios.delete(`/api/admin/coupon?code=${code}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       await fetchCoupons();
//       toast.success("Coupon deleted successfully");
//     } catch (error) {
//       toast.error(error?.response?.data?.error || error.message);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchCoupons();
//   }, []);

//   return (
//     <div className="text-slate-500 mb-40">
//       {/* Add Coupon */}
//       <form
//         onSubmit={(e) =>
//           toast.promise(handleAddCoupon(e), {
//             loading: "Adding coupon...",
//             success: "Coupon added!",
//             error: (err) => err?.response?.data?.error || "Failed to add",
//           })
//         }
//         className="max-w-sm text-sm"
//       >
//         <h2 className="text-2xl">
//           Add <span className="text-slate-800 font-medium">Coupons</span>
//         </h2>
//         <div className="flex gap-2 max-sm:flex-col mt-2">
//           <input
//             type="text"
//             placeholder="Coupon Code"
//             className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md uppercase"
//             name="code"
//             value={newCoupon.code}
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="number"
//             placeholder="Coupon Discount (%)"
//             min={1}
//             max={100}
//             className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
//             name="discount"
//             value={newCoupon.discount}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <input
//           type="text"
//           placeholder="Coupon Description"
//           className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
//           name="description"
//           value={newCoupon.description}
//           onChange={handleChange}
//           required
//         />

//         <label>
//           <p className="mt-3">Coupon Expiry Date</p>
//           <input
//             type="date"
//             className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
//             name="expiresAt"
//             value={format(new Date(newCoupon.expiresAt), "yyyy-MM-dd")}
//             onChange={handleChange}
//           />
//         </label>

//         <div className="mt-5">
//           <div className="flex gap-2 mt-3">
//             <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
//               <input
//                 type="checkbox"
//                 className="sr-only peer"
//                 name="forNewUser"
//                 checked={newCoupon.forNewUser}
//                 onChange={handleChange}
//               />
//               <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
//               <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
//             </label>
//             <p>For New User</p>
//           </div>
//           <div className="flex gap-2 mt-3">
//             <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
//               <input
//                 type="checkbox"
//                 className="sr-only peer"
//                 name="forMember"
//                 checked={newCoupon.forMember}
//                 onChange={handleChange}
//               />
//               <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
//               <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
//             </label>
//             <p>For Member</p>
//           </div>
//         </div>
//         <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">
//           Add Coupon
//         </button>
//       </form>

//       {/* List Coupons */}
//       <div className="mt-14">
//         <h2 className="text-2xl">
//           List <span className="text-slate-800 font-medium">Coupons</span>
//         </h2>
//         <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-4xl">
//           <table className="min-w-full bg-white text-sm">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   Code
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   Description
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   Discount
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   Expires At
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   New User
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   For Member
//                 </th>
//                 <th className="py-3 px-4 text-left font-semibold text-slate-600">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {coupons.map((coupon) => (
//                 <tr key={coupon.code} className="hover:bg-slate-50">
//                   <td className="py-3 px-4 font-medium text-slate-800">
//                     {coupon.code}
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     {coupon.description}
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     {coupon.discount}%
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     {format(new Date(coupon.expiresAt), "yyyy-MM-dd")}
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     {coupon.forNewUser ? "Yes" : "No"}
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     {coupon.forMember ? "Yes" : "No"}
//                   </td>
//                   <td className="py-3 px-4 text-slate-800">
//                     <DeleteIcon
//                       onClick={() =>
//                         toast.promise(deleteCoupon(coupon.code), {
//                           loading: "Deleting coupon...",
//                           success: "Deleted!",
//                           error: "Failed to delete",
//                         })
//                       }
//                       className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer"
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function AdminCoupons() {
  const { getToken } = useAuth();

  const [coupons, setCoupons] = useState([]);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  });

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/admin/coupon", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCoupons(data.coupons);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch coupons"
      );
    }
  };

  // Add Coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      const payload = {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        discount: Number(newCoupon.discount),
        expiresAt: new Date(newCoupon.expiresAt),
      };

      const { data } = await axios.post(
        "/api/admin/coupon",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message || "Coupon added successfully");

      setNewCoupon({
        code: "",
        description: "",
        discount: "",
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date(),
      });

      fetchCoupons();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to add coupon"
      );
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewCoupon((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Delete Coupon
  const deleteCoupon = async (code) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this coupon?"
      );

      if (!isConfirmed) return;

      const token = await getToken();

      await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Coupon deleted successfully");

      fetchCoupons();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to delete coupon"
      );
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="text-slate-600 mb-40">

      {/* Add Coupon Form */}
      <form
        onSubmit={handleAddCoupon}
        className="max-w-md bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
      >
        <h2 className="text-2xl font-semibold text-slate-800">
          Add Coupon
        </h2>

        {/* Code + Discount */}
        <div className="flex gap-3 max-sm:flex-col mt-4">

          <input
            type="text"
            name="code"
            placeholder="Coupon Code"
            value={newCoupon.code}
            onChange={handleChange}
            required
            className="w-full p-3 border border-slate-200 rounded-lg outline-slate-400 uppercase"
          />

          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            min={1}
            max={100}
            value={newCoupon.discount}
            onChange={handleChange}
            required
            className="w-full p-3 border border-slate-200 rounded-lg outline-slate-400"
          />
        </div>

        {/* Description */}
        <input
          type="text"
          name="description"
          placeholder="Coupon Description"
          value={newCoupon.description}
          onChange={handleChange}
          required
          className="w-full mt-3 p-3 border border-slate-200 rounded-lg outline-slate-400"
        />

        {/* Expiry Date */}
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700">
            Expiry Date
          </label>

          <input
            type="date"
            name="expiresAt"
            value={
              newCoupon.expiresAt
                ? format(
                    new Date(newCoupon.expiresAt),
                    "yyyy-MM-dd"
                  )
                : ""
            }
            onChange={handleChange}
            className="w-full mt-1 p-3 border border-slate-200 rounded-lg outline-slate-400"
          />
        </div>

        {/* Checkboxes */}
        <div className="mt-5 space-y-4">

          {/* New User */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="forNewUser"
              checked={newCoupon.forNewUser}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <p>For New Users</p>
          </div>

          {/* Member */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="forMember"
              checked={newCoupon.forMember}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <p>For Members</p>
          </div>

          {/* Public */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={newCoupon.isPublic}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <p>Public Coupon</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 active:scale-95 transition"
        >
          Add Coupon
        </button>
      </form>

      {/* Coupon List */}
      <div className="mt-14">

        <h2 className="text-2xl font-semibold text-slate-800">
          Coupon List
        </h2>

        <div className="overflow-x-auto mt-5 border border-slate-200 rounded-xl">

          <table className="min-w-full bg-white text-sm">

            <thead className="bg-slate-100">

              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">New User</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>

            </thead>

            <tbody>

              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.code}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {coupon.code}
                    </td>

                    <td className="px-4 py-3">
                      {coupon.description}
                    </td>

                    <td className="px-4 py-3">
                      {coupon.discount}%
                    </td>

                    <td className="px-4 py-3">
                      {format(
                        new Date(coupon.expiresAt),
                        "yyyy-MM-dd"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {coupon.forNewUser ? "Yes" : "No"}
                    </td>

                    <td className="px-4 py-3">
                      {coupon.forMember ? "Yes" : "No"}
                    </td>

                    <td className="px-4 py-3">
                      <Trash2
                        onClick={() =>
                          deleteCoupon(coupon.code)
                        }
                        className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    No Coupons Found
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}