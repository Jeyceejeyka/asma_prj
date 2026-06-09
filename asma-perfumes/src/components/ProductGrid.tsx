import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import type { Product } from "@/types/product";

const ProductGrid = () => {
  const { products, loading } = useCatalog();
  const [filtered, setFiltered] = useState<Product[]>(products);

  useEffect(() => { setFiltered(products); }, [products]);

  const handleResults = useCallback((results: Product[]) => {
    setFiltered(results);
  }, []);

  return (
    <section className="py-16 sm:py-28 section-padding">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center mb-12 sm:mb-20"
      >
        <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">Artisan Fragrances</p>
        <h2 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl tracking-wide text-foreground">
          The Collection
        </h2>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 sm:mt-8" />
      </motion.div>

      <div className="flex justify-center mb-8 sm:mb-12">
        <ProductSearch products={products} onResults={handleResults} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-light">No fragrances match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
