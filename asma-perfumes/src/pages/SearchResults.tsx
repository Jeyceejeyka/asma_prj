import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { products } = useCatalog();

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notes.top.toLowerCase().includes(q) ||
        p.notes.heart.toLowerCase().includes(q) ||
        p.notes.base.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q) ||
        p.season.toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <main className="pt-20 sm:pt-24 min-h-screen">
      <div className="section-padding">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6 sm:mb-8"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Search size={20} className="text-primary" />
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider">
              Search Results
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-light mb-8 sm:mb-12">
            {filtered.length} {filtered.length === 1 ? "result" : "results"} for "{query}"
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-light">No fragrances match your search.</p>
              <Link to="/" className="inline-block mt-6 btn-gold text-sm px-8 py-3">
                Explore Fragrances
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default SearchResults;
