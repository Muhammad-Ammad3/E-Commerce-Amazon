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
