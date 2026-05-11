// 'use client'
// import ProductDescription from "@/components/ProductDescription";
// import ProductDetails from "@/components/ProductDetails";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// export default function Product() {

//     const { productId } = useParams();
//     const [product, setProduct] = useState();
//     const products = useSelector(state => state.product.list);

//     const fetchProduct = async () => {
//         const product = products.find((product) => product.id === productId);
//         setProduct(product);
//     }

//     useEffect(() => {
//         if (products.length > 0) {
//             fetchProduct()
//         }
//         scrollTo(0, 0)
//     }, [productId,products]);

//     return (
//         <div className="mx-6">
//             <div className="max-w-7xl mx-auto">

//                 {/* Breadcrums */}
//                 <div className="  text-gray-600 text-sm mt-8 mb-5">
//                     Home / Products / {product?.category}
//                 </div>

//                 {/* Product Details */}
//                 {product && (<ProductDetails product={product} />)}

//                 {/* Description & Reviews */}
//                 {product && (<ProductDescription product={product} />)}
//             </div>
//         </div>
//     );
// }


'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

export default function Product() {
    const { productId } = useParams();
    const products = useSelector(state => state.product.list);
    
    // 1. useMemo ka istemal behtar hai state se, taaki extra re-renders na hon
    const product = useMemo(() => {
        return products.find((p) => String(p._id || p.id) === String(productId));
    }, [productId, products]);

    // 2. Scroll to top handle karne ke liye
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    // 3. Agar product load ho raha hai ya nahi mila
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