import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { useProductsStore } from "@/store/productsStore";
import { useCatalog } from "@/hooks/useCatalog";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import Footer from "@/components/Footer";
import type { Product } from "@/types/product";
import { useSeo } from "@/hooks/useSeo";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { products } = useCatalog();
  const getProduct = useProductsStore((s) => s.getProduct);
  const [product, setProduct] = useState<Product | undefined>(() =>
    products.find((p) => p.id === productId)
  );
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const cached = products.find((p) => p.id === productId);
    if (cached) {
      setProduct(cached);
      return;
    }
    getProduct(productId)
      .then(setProduct)
      .catch(() => setNotFound(true));
  }, [productId, products, getProduct]);

  const addItem = useCartStore((s) => s.addItem);
  const hasInCart = useCartStore((s) => s.hasItem(productId, product?.sizes[0] || ""));
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.ids.includes(productId));

  useSeo({
    title: product ? `${product.name} — ${product.collection} — Asma Perfumes` : "Asma Perfumes",
    description: product?.description || "Discover this fragrance from the Asma Perfumes atelier.",
  });

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "50ml");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (product) setSelectedSize(product.sizes[0]);
  }, [product]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const pairProduct = products.find(
    (p) => p.collection === product.collection && p.id !== product.id
  );

  const detailItems = [
    { label: "Grade", value: product.grade },
    { label: "Concentration", value: product.concentration },
    { label: "Longevity", value: product.longevity },
    { label: "Sillage", value: product.sillage },
    { label: "Season", value: product.season },
  ];

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product, selectedSize, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (e: any) {
      toast.error(e.message || "Could not add to cart");
    } finally {
      setTimeout(() => setAdding(false), 1500);
    }
  };

  const handleWishlist = () => {
    wishlistToggle(product.id);
    toast(isWished ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
  };

  return (
    <main className="pt-20 sm:pt-24">
      <div className="section-padding">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6 sm:mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-square bg-card rounded-xl overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover animate-float"
              width={640}
              height={800}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase bg-background/70 backdrop-blur-sm text-primary px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-body">
                {product.grade}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-2 sm:mb-3">{product.collection}</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider mb-3 sm:mb-4">{product.name}</h1>
            <p className="text-foreground/50 font-light italic text-sm sm:text-base mb-6 sm:mb-8">{product.description}</p>


            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 p-3 sm:p-4 border border-border/40 rounded-xl bg-card/30">
              {detailItems.map((item) => (
                <div key={item.label} className="text-center">
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground tracking-[0.2em] uppercase block">{item.label}</span>
                  <p className="text-foreground/70 text-[10px] sm:text-xs mt-0.5 font-light">{item.value}</p>
                </div>
              ))}
            </div>

            <p className="text-primary font-display text-2xl sm:text-3xl mb-4 sm:mb-6">KES {product.price.toLocaleString()}</p>

            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 sm:px-5 py-2 border text-xs sm:text-sm tracking-wider rounded-xl transition-all duration-300 ${
                    selectedSize === size
                      ? "border-primary text-primary"
                      : "border-border text-foreground/50 hover:border-foreground/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="flex items-center border border-border rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 sm:p-3 text-foreground/50 hover:text-foreground transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-3 sm:px-4 text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 sm:p-3 text-foreground/50 hover:text-foreground transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 inline-flex items-center justify-center gap-2 transition-all duration-300 ${
                  adding || hasInCart ? "btn-gold-solid" : "btn-gold-solid"
                } ${adding ? "opacity-70 pointer-events-none" : ""}`}
              >
                {adding || hasInCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button
                onClick={handleWishlist}
                className={`inline-flex items-center justify-center px-4 border rounded-xl transition-all duration-300 ${
                  isWished
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-foreground/40 hover:text-primary hover:border-primary"
                }`}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={16} fill={isWished ? "currentColor" : "none"} />
              </button>
            </div>

            {pairProduct && (
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                <p className="text-xs text-muted-foreground tracking-wider uppercase mb-2">Pairs beautifully with</p>
                <Link to={`/product/${pairProduct.id}`} className="text-primary hover:underline font-display tracking-wider">
                  {pairProduct.name}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="section-padding py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl sm:text-2xl tracking-wider mb-4">The Scent Story</h2>
          <div className="w-12 h-px bg-primary mb-6" />
          <p className="text-foreground/50 font-light leading-relaxed text-sm sm:text-base">{product.description} Every note has been carefully selected and layered to create a fragrance experience that evolves throughout the day, revealing new facets with each passing hour.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ProductDetail;
