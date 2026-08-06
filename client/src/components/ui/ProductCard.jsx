import { useState } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiEye, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import RatingStars from "./RatingStars";

export default function ProductCard({ product, index = 0 }) {
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = () => {
    setWishlisted((prev) => !prev);
    toast.success(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      { position: "bottom-center" }
    );
  };

  const addToCart = () => {
    toast.success(`${product.name} added to cart`, {
      position: "bottom-center",
      icon: "🛒",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="card-float group relative overflow-hidden p-3"
    >
      <div className="relative overflow-hidden rounded-xl3 aspect-square bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-heading font-semibold text-white shadow-soft">
            -{product.discount}%
          </span>
        )}

        <button
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300 ${
            wishlisted ? "bg-danger text-white" : "bg-white/80 text-dark hover:bg-white"
          }`}
        >
          <FiHeart className={wishlisted ? "fill-current" : ""} size={15} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-14 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={addToCart}
            className="flex-1 rounded-full bg-dark/90 py-2.5 text-xs font-heading font-semibold text-white backdrop-blur-md transition-colors hover:bg-primary flex items-center justify-center gap-1.5"
          >
            <FiPlus size={14} /> Add to Cart
          </button>
          <button
            aria-label="Quick view"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 text-dark transition-colors hover:bg-white"
          >
            <FiEye size={14} />
          </button>
        </div>
      </div>

      <div className="px-1.5 pt-4 pb-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-primary-600">
          {product.category}
        </p>
        <h3 className="mt-1 font-heading text-[15px] font-semibold text-dark line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-dark/45">{product.unit}</p>

        <div className="mt-2 flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-dark/40">({product.reviews})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold text-dark">
            ₹{product.price}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-dark/35 line-through">
              ₹{product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
