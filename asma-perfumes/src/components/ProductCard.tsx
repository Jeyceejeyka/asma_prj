import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Heart, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const hasInCart = useCartStore((s) => s.hasItem(product.id, product.sizes[0]));
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.ids.includes(product.id));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const handleInteraction = () => setRevealed(true);
  const handleLeave = () => setRevealed(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
      return;
    }
    if (addingCart || hasInCart) return;
    setAddingCart(true);

    try {
      await addItem(product, product.sizes[0]);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add item to cart");
    } finally {
      setTimeout(() => setAddingCart(false), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistAnimating(true);
    wishlistToggle(product.id);
    toast(isWished ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
    setTimeout(() => setWishlistAnimating(false), 400);
  };

  const isAdded = addingCart || hasInCart;

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleInteraction}
      onMouseLeave={handleLeave}
      onTouchStart={handleInteraction}
      className="group relative"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Card Container */}
        <div className="relative aspect-[4/5] bg-card rounded-2xl overflow-hidden">
          {/* Subtle Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Image */}
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={640}
            height={800}
            className="w-full h-full object-cover"
            itemProp="image"
            animate={{ scale: revealed ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = "/placeholder.svg";
            }}
          />

          {/* Multi-layered Overlays */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-500"
            style={{ opacity: revealed ? 0.7 : 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Gold Line */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ width: revealed ? "70%" : "0%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Bottom Gold Line */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            animate={{ width: revealed ? "50%" : "0%" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          />

          {/* Grade Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 left-4"
          >
            <span className="text-[9px] tracking-[0.25em] uppercase bg-background/70 backdrop-blur-md text-primary px-3 py-1.5 rounded-xl font-body border border-primary/10">
              {product.grade}
            </span>
          </motion.div>

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.9 }}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isWished
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-background/60 text-foreground/40 hover:text-primary hover:bg-primary/10"
            }`}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isWished ? "wished" : "not-wished"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Heart
                  size={15}
                  fill={isWished ? "currentColor" : "none"}
                  className={wishlistAnimating ? "animate-pulse" : ""}
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Exclusive Badge (if applicable) */}
          {product.collection === "Royal Oud" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : 10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-4 left-1/2 -translate-x-1/2"
            >
              <span className="text-[8px] tracking-[0.3em] uppercase bg-primary/90 text-primary-foreground px-3 py-1 rounded-full font-body flex items-center gap-1">
                <Sparkles size={10} />
                Exclusive
              </span>
            </motion.div>
          )}

          {/* Hover Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: "1px solid",
              borderColor: revealed ? "hsl(var(--primary) / 0.25)" : "transparent",
            }}
            animate={{
              boxShadow: revealed
                ? "0 0 50px hsl(var(--primary) / 0.15), 0 25px 80px hsl(0 0% 0% / 0.2)"
                : "0 0 0 transparent",
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </Link>

      {/* Content Below Image */}
      <div className="mt-5 text-center px-1">
        {/* Collection Name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 0.6 : 0.4 }}
          className="text-muted-foreground text-[9px] tracking-[0.25em] uppercase mb-2"
        >
          {product.collection}
        </motion.p>

        {/* Product Name */}
        <h3
          className="font-display text-sm sm:text-base tracking-wider text-foreground transition-colors duration-400"
          itemProp="name"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p
          className="text-muted-foreground text-[11px] italic mt-1.5 opacity-60 line-clamp-1"
          itemProp="description"
        >
          {product.description}
        </p>

        {/* Revealable Details */}
        <motion.div
          initial={false}
          animate={{ opacity: revealed ? 1 : 0, height: revealed ? "auto" : 0, marginTop: revealed ? 12 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          {/* Scent Profile */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground tracking-wider mb-3">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              {product.sillage}
            </span>
            <span>{product.longevity}</span>
            <span>{product.season}</span>
          </div>

          {/* Price */}
          <p
            className="text-primary text-xl font-display"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content="KES" />
            <span itemProp="price" content={String(product.price)}>
              KES {product.price.toLocaleString()}
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 mt-4">
            <motion.button
              onClick={handleAddToCart}
              disabled={isAdded}
              whileTap={{ scale: 0.97 }}
              className={`inline-flex items-center gap-2 text-xs py-2.5 px-6 rounded-xl transition-all duration-300 ${
                isAdded
                  ? "bg-primary text-primary-foreground border border-primary cursor-default"
                  : "btn-gold hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={13} /> Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.9 }}
              className={`inline-flex items-center justify-center border text-sm p-2.5 transition-all duration-300 rounded-xl ${
                isWished
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={15} fill={isWished ? "currentColor" : "none"} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
