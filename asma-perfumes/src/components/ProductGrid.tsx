import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import type { Product } from "@/types/product";

const ProductGrid = () => {
  const { products, loading } = useCatalog();
  const [filtered, setFiltered] = useState<Product[]>(products);

  useEffect(() => {
    setFiltered(products);
  }, [products]);

  const handleResults = useCallback((results: Product[]) => {
    setFiltered(results);
  }, []);

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/[0.015] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/[0.01] rounded-full blur-[150px] pointer-events-none" />

      <div className="section-padding relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-12 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <Sparkles size={12} className="text-primary/50" />
            <p className="text-primary/60 text-[10px] tracking-[0.45em] uppercase font-body">
              Artisan Fragrances
            </p>
            <Sparkles size={12} className="text-primary/50" />
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground"
          >
            The Collection
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-6 sm:mt-8"
          />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-10 sm:mb-16"
        >
          <ProductSearch products={products} onResults={handleResults} />
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
            {filtered.length !== products.length && (
              <span className="text-primary/60 ml-2">
                (filtered from {products.length})
              </span>
            )}
          </p>
        </motion.div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground/60 font-light text-lg">
              No fragrances match your search.
            </p>
            <p className="text-muted-foreground/40 text-sm mt-2">
              Try adjusting your filters or search terms.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
