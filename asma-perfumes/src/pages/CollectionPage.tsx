import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { resolveCollectionImage } from "@/lib/assets";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const gradeFilters = ["All", "Eau de Cologne", "Eau de Toilette", "Eau de Parfum", "Extrait", "Parfum"];
const seasonFilters = ["All", "Spring", "Summer", "Autumn", "Winter", "All Seasons"];
const genderFilters = ["All", "Unisex", "Masculine", "Feminine"];

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-[9px] tracking-[0.12em] uppercase font-body whitespace-nowrap rounded-full border transition-all duration-300 ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

const CollectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const name = decodeURIComponent(id || "");
  const { products, collections } = useCatalog();
  const collection = collections.find((c) => c.name === name);

  useSeo({
    title: collection ? `${collection.name} — Asma Perfumes` : "Collections — Asma Perfumes",
    description: collection?.tagline || collection?.description || "Explore Asma Perfumes signature collections — modern, intimate fragrances.",
  });

  const [activeCollection, setActiveCollection] = useState(name || "All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const collectionNames = ["All", ...collections.map((c) => c.name)];

  const filtered = products.filter((p) => {
    if (activeCollection !== "All" && p.collection !== activeCollection) return false;
    if (gradeFilter !== "All" && p.grade !== gradeFilter) return false;
    if (seasonFilter !== "All" && p.season !== seasonFilter) return false;
    if (genderFilter !== "All" && p.gender !== genderFilter) return false;
    return true;
  });

  const activeFilterCount = [activeCollection, gradeFilter, seasonFilter, genderFilter].filter((f) => f !== "All").length;

  const resetFilters = () => {
    setActiveCollection("All");
    setGradeFilter("All");
    setSeasonFilter("All");
    setGenderFilter("All");
  };

  return (
    <main>
      {/* Compact Hero */}
      <section className="relative h-[30vh] sm:h-[40vh] flex items-center justify-center overflow-hidden">
        {collection ? (
          <HeroImage collection={collection} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
        <div className="relative z-10 text-center max-w-2xl px-4 sm:px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-primary/50 text-[10px] tracking-[0.4em] uppercase mb-3 sm:mb-4 font-body"
          >
            Our Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wider text-foreground"
          >
            {collection ? collection.name : "All Fragrances"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-muted-foreground mt-2 sm:mt-3 italic font-light text-xs sm:text-sm"
          >
            {collection ? collection.tagline : "Explore our complete catalog of luxury scents"}
          </motion.p>
        </div>
      </section>

      <section className="section-padding py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs">
            <ArrowLeft size={12} /> Back
          </Link>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-[10px] tracking-[0.1em] uppercase text-primary/70 hover:text-primary font-body transition-colors">
              Clear all filters
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="border border-border/40 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={12} className="text-primary/60" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Filters</span>
            <span className="text-[10px] text-muted-foreground/50 font-body ml-1">
              — {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Each filter row */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 font-body w-16 sm:w-[60px] shrink-0">Collection</span>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {collectionNames.map((c) => (
                  <FilterPill key={c} label={c} active={activeCollection === c} onClick={() => setActiveCollection(c)} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 font-body w-16 sm:w-[60px] shrink-0">Grade</span>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {gradeFilters.map((g) => (
                  <FilterPill key={g} label={g} active={gradeFilter === g} onClick={() => setGradeFilter(g)} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 font-body w-16 sm:w-[60px] shrink-0">Season</span>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {seasonFilters.map((s) => (
                  <FilterPill key={s} label={s} active={seasonFilter === s} onClick={() => setSeasonFilter(s)} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 font-body w-16 sm:w-[60px] shrink-0">Gender</span>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {genderFilters.map((g) => (
                  <FilterPill key={g} label={g} active={genderFilter === g} onClick={() => setGenderFilter(g)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-light">No fragrances match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default CollectionPage;

const HeroImage = ({ collection }: { collection: { name: string; image?: string } }) => {
  const [src, setSrc] = useState(collection.image || resolveCollectionImage(collection.name));

  return (
    <img
      src={src}
      alt={collection.name}
      className="absolute inset-0 w-full h-full object-cover opacity-30"
      onError={() => setSrc(resolveCollectionImage(collection.name))}
    />
  );
};
