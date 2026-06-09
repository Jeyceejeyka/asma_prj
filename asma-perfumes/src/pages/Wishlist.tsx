import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useCatalog } from "@/hooks/useCatalog";
import Footer from "@/components/Footer";

const Wishlist = () => {
  const { products } = useCatalog();
  const ids = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const openCart = useCartStore((s) => s.openCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
      return false;
    }
    return true;
  };

  const undoMove = (
    movedIds: number[],
    consumed: { done: boolean },
    toastId: string | number,
    movedCount: number
  ) => {
    if (consumed.done) return;
    consumed.done = true;
    toast.dismiss(toastId);

    let restored = 0;
    movedIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const size = product.sizes[0];
      const existing = useCartStore.getState().items.find(
        (i) => i.product.id === id && i.size === size
      );
      if (existing && existing.quantity > 0) {
        updateQuantity(id, size, existing.quantity - 1);
      }
      if (!useWishlistStore.getState().ids.includes(id)) {
        toggleWishlist(id);
        restored += 1;
      }
    });

    toast.success(
      `Restored ${restored} of ${movedCount} ${movedCount === 1 ? "item" : "items"} to wishlist`
    );
  };

  const handleMoveOne = (productId: number) => {
    if (!requireAuth()) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addItem(product, product.sizes[0]);
    toggleWishlist(productId);
    const consumed = { done: false };
    const tId = toast.success(`1 item moved to cart · ${product.name}`, {
      action: {
        label: "Undo",
        onClick: () => undoMove([productId], consumed, tId, 1),
      },
    });
  };

  const handleMoveAll = () => {
    if (!requireAuth()) return;
    if (wishlistProducts.length === 0) return;
    const movedIds = wishlistProducts.map((p) => p.id);
    const movedCount = movedIds.length;
    wishlistProducts.forEach((product) => {
      addItem(product, product.sizes[0]);
      toggleWishlist(product.id);
    });
    const consumed = { done: false };
    const tId = toast.success(
      `${movedCount} ${movedCount === 1 ? "item" : "items"} moved to cart`,
      {
        action: {
          label: "Undo",
          onClick: () => undoMove(movedIds, consumed, tId, movedCount),
        },
      }
    );
    openCart();
  };


  return (
    <main className="pt-20 sm:pt-24">
      <div className="section-padding">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6 sm:mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider mb-2">Your Wishlist</h1>
              <p className="text-muted-foreground text-sm font-light">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "fragrance" : "fragrances"} saved
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <button
                onClick={handleMoveAll}
                className="btn-gold-solid inline-flex items-center justify-center gap-2 text-xs px-6 py-3"
              >
                <ShoppingBag size={14} /> Move all to cart
              </button>
            )}
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-light">Your wishlist is empty.</p>
              <Link to="/" className="inline-block mt-6 btn-gold text-sm px-8 py-3">
                Explore Fragrances
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
              {wishlistProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] bg-card rounded-xl overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                          toast(`${product.name} removed from wishlist`);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/70 backdrop-blur-sm text-foreground/60 hover:text-destructive transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </Link>
                  <div className="mt-4 text-center">
                    <h3 className="font-display text-sm tracking-wider">{product.name}</h3>
                    <p className="text-primary text-sm mt-1 font-display">KES {product.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleMoveOne(product.id)}
                      className="btn-gold inline-flex items-center gap-2 text-xs px-5 py-2 mt-3 rounded-xl"
                    >
                      <ShoppingBag size={12} /> Move to cart
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default Wishlist;
