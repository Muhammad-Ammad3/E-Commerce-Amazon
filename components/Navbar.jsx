// "use client";
// import {
//   PackageIcon,
//   Search,
//   ShoppingCart,
//   ShoppingCartIcon,
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useSelector } from "react-redux";
// import {
//   useUser,
//   useClerk,
//   UserButton,
//   Show,
// } from "@clerk/nextjs";
// import ProductDescription from "./ProductDescription";

// const Navbar = () => {
//   const { user } = useUser();
//   const { openSignIn } = useClerk();

//   const router = useRouter();

//   const [search, setSearch] = useState("");
//   const cartCount = useSelector((state) => state.cart.total);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     router.push(`/shop?search=${search}`);
//   };

//   return (
//     <nav className="relative bg-white">
//       <div className="mx-6">
//         <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">
//           <Link
//             href="/"
//             className="relative text-4xl font-semibold text-slate-700"
//           >
//             <span className="text-green-600">go</span>cart
//             <span className="text-green-600 text-5xl leading-0">.</span>
//             <Show when={{ plan: 'plus' }}>
//               <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
//                 plus
//               </p>
//             </Show>
//           </Link>

//           {/* Desktop Menu */}
//           <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
//             <Link href="/">Home</Link>
//             <Link href="/shop">Shop</Link>
//             <Link href="/">About</Link>
//             <Link href="/">Contact</Link>

//             <form
//               onSubmit={handleSearch}
//               className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
//             >
//               <Search size={18} className="text-slate-600" />
//               <input
//                 className="w-full bg-transparent outline-none placeholder-slate-600"
//                 type="text"
//                 placeholder="Search products"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 required
//               />
//             </form>

//             <Link
//               href="/cart"
//               className="relative flex items-center gap-2 text-slate-600"
//             >
//               <ShoppingCart size={18} />
//               Cart
//               <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
//                 {cartCount}
//               </button>
//             </Link>

//             {!user ? (
//               <button
//                 onClick={openSignIn}
//                 className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
//               >
//                 Login
//               </button>
//             ) : (
//               <UserButton afterSignOutUrl="/">
//                 <UserButton.MenuItems>
//                   <UserButton.Action
//                     labelIcon={<PackageIcon size={16} />}
//                     label="My Orders"
//                     onClick={() => router.push("/orders")}
//                   />
//                 </UserButton.MenuItems>
//               </UserButton>
//             )}
//           </div>

//           {/* Mobile User Button  */}
//           <div className="sm:hidden">
//             {user ? (
//               <div>
//                 <UserButton afterSignOutUrl="/">
//                   <UserButton.MenuItems>
//                     <UserButton.Action
//                       labelIcon={<ShoppingCartIcon size={16} />}
//                       label="Cart"
//                       onClick={() => router.push("/cart")}
//                     />
//                   </UserButton.MenuItems>
//                 </UserButton>
//                 <UserButton afterSignOutUrl="/">
//                   <UserButton.MenuItems>
//                     <UserButton.Action
//                       labelIcon={<PackageIcon size={16} />}
//                       label="My Orders"
//                       onClick={() => router.push("/orders")}
//                     />
//                   </UserButton.MenuItems>
//                 </UserButton>
//               </div>
//             ) : (
//               <button
//                 onClick={openSignIn}
//                 className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full"
//               >
//                 Login
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//       <hr className="border-gray-300" />
//     </nav>
//   );
// };

// export default Navbar;

"use client";

import {
  Menu,
  PackageIcon,
  Search,
  ShoppingCart,
  ShoppingCartIcon,
  X,
  ShieldUser,
  Store,
  PlusCircle,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { useUser, useClerk, UserButton, Show } from "@clerk/nextjs";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const router = useRouter();

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // Store States
  const [hasStore, setHasStore] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);

  const cartCount = useSelector((state) => state.cart.total);

  // ✅ Check Store Status
  useEffect(() => {
    const checkStoreStatus = async () => {
      if (!user) {
        setHasStore(false);
        setLoadingStore(false);
        return;
      }

      try {
        setLoadingStore(true);

        const res = await fetch("/api/store/is-seller");

        const data = await res.json();

        // ✅ Store exists
        if (res.ok && data.storeInfo) {
          setHasStore(true);
        } else {
          // ❌ Store not exists
          setHasStore(false);
        }
      } catch (error) {
        console.error("Error fetching store status:", error);
        setHasStore(false);
      } finally {
        setLoadingStore(false);
      }
    };

    checkStoreStatus();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/shop?search=${search}`);
    setMobileMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="relative text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700"
          >
            <span className="text-green-600">go</span>cart
            <span className="text-green-600 text-3xl sm:text-5xl">.</span>

            <Show when={{ plan: "plus" }}>
              <p className="absolute text-[10px] sm:text-xs font-semibold -top-2 -right-8 px-2 py-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                plus
              </p>
            </Show>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 text-slate-600">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>

            <Link href="/shop" className="hover:text-black transition">
              Shop
            </Link>

            <Link href="/" className="hover:text-black transition">
              About
            </Link>

            <Link href="/" className="hover:text-black transition">
              Contact
            </Link>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center w-72 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />

              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 hover:text-black transition"
            >
              <ShoppingCart size={20} />
              Cart

              <span className="absolute -top-2 left-4 text-[10px] text-white bg-slate-700 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            </Link>

            {/* User */}
            {!user ? (
              <button
                onClick={openSignIn}
                className="px-7 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                Login
              </button>
            ) : (
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  {/* Orders */}
                  <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="My Orders"
                    onClick={() => router.push("/orders")}
                  />

                  {/* Store Logic */}
                  {!loadingStore &&
                    (hasStore ? (
                      <UserButton.Action
                        labelIcon={<Store size={16} />}
                        label="My Store"
                        onClick={() => router.push("/store")}
                      />
                    ) : (
                      <UserButton.Action
                        labelIcon={<PlusCircle size={16} />}
                        label="Create Store"
                        onClick={() => router.push("/create-store")}
                      />
                    ))}

                  {/* Admin */}
                  <UserButton.Action
                    labelIcon={<ShieldUser size={16} />}
                    label="Admin"
                    onClick={() => router.push("/admin")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} />

              <span className="absolute -top-2 -right-2 text-[10px] text-white bg-slate-700 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            </Link>

            {/* Mobile User */}
            {user && (
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="My Orders"
                    onClick={() => router.push("/orders")}
                  />

                  <UserButton.Action
                    labelIcon={<ShoppingCartIcon size={16} />}
                    label="Cart"
                    onClick={() => router.push("/cart")}
                  />

                  {/* Mobile Store Logic */}
                  {!loadingStore &&
                    (hasStore ? (
                      <UserButton.Action
                        labelIcon={<Store size={16} />}
                        label="My Store"
                        onClick={() => router.push("/store")}
                      />
                    ) : (
                      <UserButton.Action
                        labelIcon={<PlusCircle size={16} />}
                        label="Create Store"
                        onClick={() => router.push("/create-store")}
                      />
                    ))}

                  {/* Admin */}
                  <UserButton.Action
                    labelIcon={<ShieldUser size={16} />}
                    label="Admin"
                    onClick={() => router.push("/admin")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}

            {/* Hamburger */}
            <button onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenu ? "max-h-[500px] pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-5 pt-4 text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenu(false)}
              className="hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileMenu(false)}
              className="hover:text-black"
            >
              Shop
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenu(false)}
              className="hover:text-black"
            >
              About
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenu(false)}
              className="hover:text-black"
            >
              Contact
            </Link>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />

              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Login */}
            {!user && (
              <button
                onClick={openSignIn}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;