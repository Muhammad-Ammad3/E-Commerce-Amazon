"use client";

import { assets } from "@/assets/assets";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function StoreAddProduct() {
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
  ];

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [previews, setPreviews] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const { getToken } = useAuth();

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    setProductInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only image files are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size should be less than 5MB");
    }

    if (previews[key]) {
      URL.revokeObjectURL(previews[key]);
    }

    const previewUrl = URL.createObjectURL(file);

    setImages((prev) => ({
      ...prev,
      [key]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [key]: previewUrl,
    }));

    if (key === "1" && !aiUsed && !aiLoading) {
      setAiLoading(true);

      try {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = async () => {
          try {
            const result = reader.result;

            if (!result) {
              throw new Error("Failed to read image");
            }

            const base64String = result.split(",")[1];
            const mimeType = file.type;

            const token = await getToken();

            await toast.promise(
              axios.post(
                "/api/store/ai",
                {
                  base64Image: base64String,
                  mimeType,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              ),
              {
                loading: "Analyzing image with AI...",

                success: (res) => {
                  const data = res.data;

                  if (data?.name || data?.description) {
                    setProductInfo((prev) => ({
                      ...prev,
                      name: data?.name || prev.name,
                      description: data?.description || prev.description,
                    }));

                    setAiUsed(true);

                    return "AI filled product info";
                  }

                  return "AI could not analyze the image";
                },

                error: (err) => err?.response?.data?.error || err.message,
              },
            );
          } catch (error) {
            console.error(error);
            toast.error("AI analysis failed");
          } finally {
            setAiLoading(false);
          }
        };
      } catch (error) {
        console.error(error);
        setAiLoading(false);
      }
    }
  };

  const resetForm = () => {
    Object.values(previews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });

    setProductInfo({
      name: "",
      description: "",
      mrp: "",
      price: "",
      category: "",
    });

    setImages({
      1: null,
      2: null,
      3: null,
      4: null,
    });

    setPreviews({
      1: null,
      2: null,
      3: null,
      4: null,
    });

    setAiUsed(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      const uploadedImages = Object.values(images).filter(
        (img) => img !== null,
      );

      if (uploadedImages.length === 0) {
        return toast.error("Please upload at least one image");
      }

      if (Number(productInfo.price) > Number(productInfo.mrp)) {
        return toast.error("Offer price cannot be greater than actual price");
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("name", productInfo.name.trim());
      formData.append("description", productInfo.description.trim());
      formData.append("mrp", Number(productInfo.mrp));
      formData.append("price", Number(productInfo.price));
      formData.append("category", productInfo.category);

      uploadedImages.forEach((img) => {
        formData.append("images", img);
      });

      const token = await getToken();

      const { data } = await axios.post("/api/store/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(data?.message || "Product added");

      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error || error.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Add New <span className="text-slate-800 font-medium">Products</span>
      </h1>

      <p className="mt-7">Product Images</p>

      <div className="flex gap-3 mt-4 flex-wrap">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`} className="cursor-pointer">
            <div className="relative h-24 w-24 border border-slate-200 rounded overflow-hidden bg-white">
              <Image
                fill
                className="object-cover"
                src={previews[key] || assets.upload_area}
                alt="preview"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              id={`images${key}`}
              hidden
              onChange={(e) => handleImageUpload(key, e.target.files?.[0])}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2 my-6">
        <label className="font-medium text-slate-700">Name</label>

        <input
          type="text"
          name="name"
          value={productInfo.name}
          onChange={onChangeHandler}
          placeholder="Enter product name"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded focus:border-slate-400"
          required
        />
      </div>

      <div className="flex flex-col gap-2 my-6">
        <label className="font-medium text-slate-700">Description</label>

        <textarea
          name="description"
          value={productInfo.description}
          onChange={onChangeHandler}
          placeholder="Enter product description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none focus:border-slate-400"
          required
        />
      </div>

      <div className="flex gap-5 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-slate-700">Actual Price ($)</label>

          <input
            type="number"
            name="mrp"
            min="0"
            value={productInfo.mrp}
            onChange={onChangeHandler}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-slate-700">Offer Price ($)</label>

          <input
            type="number"
            name="price"
            min="0"
            value={productInfo.price}
            onChange={onChangeHandler}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 my-6">
        <label className="font-medium text-slate-700">Category</label>

        <select
          value={productInfo.category}
          onChange={(e) =>
            setProductInfo((prev) => ({
              ...prev,
              category: e.target.value,
            }))
          }
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded bg-white"
          required
        >
          <option value="">Select a category</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`${
          loading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-slate-800 hover:bg-slate-900"
        } text-white px-10 py-2.5 rounded transition font-medium`}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
