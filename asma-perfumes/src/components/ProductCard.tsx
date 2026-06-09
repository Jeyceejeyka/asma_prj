import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Heart, Check } from "lucide-react";
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
    wishlistToggle(product.id);
    toast(isWished ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
  };

  const isAdded = addingCart || hasInCart;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      onMouseEnter={handleInteraction}
      onMouseLeave={handleLeave}
      onTouchStart={handleInteraction}
      className="group relative"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="relative aspect-[4/5] bg-card rounded-xl overflow-hidden transition-all duration-500"
          style={{
            border: "1px solid",
            borderColor: revealed ? "hsl(var(--primary) / 0.3)" : "transparent",
            boxShadow: revealed
              ? "0 0 40px hsl(var(--primary) / 0.12), 0 20px 60px hsl(0 0% 0% / 0.15)"
              : "0 0 0 transparent",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={640}
            height={800}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            itemProp="image"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="absolute top-3 left-3">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-background/70 backdrop-blur-sm text-primary px-2.5 py-1 rounded-xl font-body">
              {product.grade}
            </span>
          </div>
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isWished
                ? "bg-primary/20 text-primary"
                : "bg-background/50 text-foreground/40 hover:text-primary"
            }`}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={isWished ? "currentColor" : "none"} />
          </button>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-all duration-500" />
        </div>
      </Link>

      <div className="mt-5 text-center">
        <h3 className="font-display text-sm md:text-base tracking-wider text-foreground group-hover:text-primary transition-colors duration-400" itemProp="name">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-[11px] italic mt-1 opacity-60 line-clamp-1" itemProp="description">{product.description}</p>



        <motion.div
          initial={false}
          animate={{ opacity: revealed ? 1 : 0, height: revealed ? "auto" : 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground tracking-wider">
            <span>{product.sillage}</span>
            <span className="text-primary/30">·</span>
            <span>{product.longevity}</span>
            <span className="text-primary/30">·</span>
            <span>{product.season}</span>
          </div>
          <p className="text-primary text-xl mt-2 font-display" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="priceCurrency" content="KES" />
            <span itemProp="price" content={String(product.price)}>KES {product.price.toLocaleString()}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`inline-flex items-center gap-2 text-xs py-2 px-5 rounded-xl transition-all duration-300 ${
                isAdded
                  ? "bg-primary text-primary-foreground border border-primary cursor-default"
                  : "btn-gold hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {isAdded ? (
                <><Check size={12} /> Added</>
              ) : (
                <><Plus size={12} /> Add</>
              )}
            </button>
            <button
              onClick={handleWishlist}
              className={`inline-flex items-center justify-center border text-xs p-2 transition-all duration-300 rounded-xl ${
                isWished
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={14} fill={isWished ? "currentColor" : "none"} />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
