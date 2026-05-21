'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

export default function Product() {
    const { productId } = useParams();
    const products = useSelector(state => state.product.list);
    
    const product = useMemo(() => {
        return products.find((p) => String(p._id || p.id) === String(productId));
    }, [productId, products]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    if (products.length > 0 && !product) {
        return <div className="text-center mt-20">Product not found!</div>;
    }

    if (!product) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5 capitalize">
                    Home / Products / {product.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}