// "use client";
// import Banner from "@/components/Banner";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { useEffect, useRef } from "react"; // useRef add kiya
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProducts } from "@/lib/features/product/productSlice.js";
// import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice.js";
// import { useUser, useAuth } from "@clerk/nextjs";
// import { fetchAddress } from "@/lib/features/address/addressSlice";
// import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

// export default function PublicLayout({ children }) {
//   const dispatch = useDispatch();
//   const { user, isLoaded } = useUser(); // isLoaded check karna behtar hai
//   const { getToken } = useAuth();
//   const { cartItems } = useSelector((state) => state.cart);

//   // Is ref ka use hum pehli baar (mount) par API call rokne ke liye karenge
//   const isInitialMount = useRef(true);

//   // 1. Fetch Products on Mount
//   useEffect(() => {
//     dispatch(fetchProducts({}));
//   }, [dispatch]);

//   // 2. Fetch Cart when User logs in
//   useEffect(() => {
//     if (isLoaded && user) {
//       dispatch(fetchCart({ getToken }));
//       dispatch(fetchAddress({ getToken }));
//       dispatch(fetchUserRatings({ getToken })); // User ratings bhi fetch kar lete hain login ke baad
//     }
//   }, [isLoaded, user, getToken, dispatch]);

//   // 3. Upload Cart with Debouncing
//   useEffect(() => {
//     // Agar user nahi hai ya pehli baar page load hua hai toh upload na karein
//     if (!user) return;

//     if (isInitialMount.current) {
//       isInitialMount.current = false;
//       return;
//     }

//     // Debounce logic: 1 second wait karein phir API call karein
//     const handler = setTimeout(() => {
//       dispatch(uploadCart({ getToken }));
//     }, 1000);

//     // Agar user phir se click kare toh purana timeout clear ho jaye
//     return () => clearTimeout(handler);
//   }, [cartItems, user, getToken, dispatch]);

//   return (
//     <>
//       <Banner />
//       <Navbar />
//       {children}
//       <Footer />
//     </>
//   );
// }

"use client";

import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";

import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

import { useUser, useAuth } from "@clerk/nextjs";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();

  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const { cartItems } = useSelector((state) => state.cart);

  const isInitialMount = useRef(true);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Fetch user data after login
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    dispatch(fetchCart({ getToken }));
    dispatch(fetchAddress({ getToken }));
    dispatch(fetchUserRatings({ getToken }));
  }, [isLoaded, isSignedIn, dispatch, getToken]);

  // Upload cart with debounce
  useEffect(() => {
    if (!isSignedIn) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!cartItems?.length) return;

    const handler = setTimeout(() => {
      dispatch(uploadCart({ getToken }));
    }, 1000);

    return () => clearTimeout(handler);
  }, [cartItems, isSignedIn, user?.id, dispatch, getToken]);

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
