import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Filter, RotateCcw } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import ScentQuiz from "@/components/ScentQuiz";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

type Mood = "Bold" | "Soft" | "Fresh" | "Warm" | "Mysterious";
type Occasion = "Day" | "Night" | "Office" | "Date" | "Special";

const moods: Mood[] = ["Bold", "Soft", "Fresh", "Warm", "Mysterious"];
const occasions: Occasion[] = ["Day", "Night", "Office", "Date", "Special"];
const seasons = ["Spring", "Summer", "Autumn", "Winter", "All Seasons"] as const;
const genders = ["Unisex", "Masculine", "Feminine"] as const;

const moodMap: Record<Mood, { sillage?: string[]; season?: string[] }> = {
  Bold: { sillage: ["Strong", "Enormous"] },
  Soft: { sillage: ["Intimate", "Moderate"] },
  Fresh: { season: ["Spring", "Summer"] },
  Warm: { season: ["Autumn", "Winter"] },
  Mysterious: { sillage: ["Strong", "Enormous"], season: ["Autumn", "Winter"] },
};

const occasionMap: Record<Occasion, { season?: string[]; sillage?: string[] }> = {
  Day: { season: ["Spring", "Summer", "All Seasons"], sillage: ["Intimate", "Moderate"] },
  Night: { season: ["Autumn", "Winter"], sillage: ["Strong", "Enormous"] },
  Office: { sillage: ["Intimate", "Moderate"] },
  Date: { sillage: ["Moderate", "Strong"] },
  Special: { sillage: ["Strong", "Enormous"] },
};

const AIFinder = () => {
  const { products, loading } = useCatalog();
  const [mood, setMood] = useState<Mood | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const recommendations = useMemo(() => {
    let list = [...products];
    const moodRule = mood ? moodMap[mood] : undefined;
    const occRule = occasion ? occasionMap[occasion] : undefined;

    const sillageFilters = [moodRule?.sillage, occRule?.sillage].filter(Boolean) as string[][];
    const seasonFilters = [moodRule?.season, occRule?.season].filter(Boolean) as string[][];

    if (sillageFilters.length) {
      list = list.filter((p) => sillageFilters.every((f) => f.includes(p.sillage)));
    }
    if (seasonFilters.length) {
      list = list.filter((p) => seasonFilters.every((f) => f.includes(p.season)));
    }
    if (season) list = list.filter((p) => p.season === season);
    if (gender) list = list.filter((p) => p.gender === gender);
    if (maxPrice) list = list.filter((p) => p.price <= maxPrice);

    // If too restrictive, fall back to soft scoring
    if (list.length === 0 && (mood || occasion || season || gender || maxPrice)) {
      list = [...products]
        .map((p) => {
          let score = 0;
          if (moodRule?.sillage?.includes(p.sillage)) score += 2;
          if (moodRule?.season?.includes(p.season)) score += 2;
          if (occRule?.sillage?.includes(p.sillage)) score += 1;
          if (occRule?.season?.includes(p.season)) score += 1;
          if (season && p.season === season) score += 2;
          if (gender && p.gender === gender) score += 2;
          if (maxPrice && p.price <= maxPrice) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((x) => x.p);
    }

    return list.slice(0, 12);
  }, [products, mood, occasion, season, gender, maxPrice]);

  const reset = () => {
    setMood(null);
    setOccasion(null);
    setSeason(null);
    setGender(null);
    setMaxPrice(null);
  };

  const hasFilters = mood || occasion || season || gender || maxPrice;

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs tracking-wider border transition-all duration-300 ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );

  return (
    <main className="pt-20 sm:pt-24 min-h-screen">
      <section className="section-padding py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 text-primary text-xs tracking-[0.3em] uppercase mb-4">
            <Sparkles size={14} /> AI Fragrance Finder
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl tracking-wide text-foreground mb-4">
            Discover Your <span className="italic text-primary">Signature</span>
          </h1>
          <p className="text-muted-foreground font-light text-sm sm:text-base max-w-xl mx-auto">
            Tell us your mood, occasion and preferences. We'll match you with fragrances from our collection.
          </p>
          <div className="w-16 h-px bg-primary mx-auto mt-6" />
        </motion.div>
      </section>

      <section className="section-padding pb-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Mood</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <Chip key={m} active={mood === m} onClick={() => setMood(mood === m ? null : m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {occasions.map((o) => (
                <Chip key={o} active={occasion === o} onClick={() => setOccasion(occasion === o ? null : o)}>
                  {o}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Season</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => (
                  <Chip key={s} active={season === s} onClick={() => setSeason(season === s ? null : s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Gender</p>
              <div className="flex flex-wrap gap-2">
                {genders.map((g) => (
                  <Chip key={g} active={gender === g} onClick={() => setGender(gender === g ? null : g)}>
                    {g}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Max Price (KES)</p>
            <div className="flex flex-wrap gap-2">
              {[5000, 10000, 20000, 50000].map((price) => (
                <Chip
                  key={price}
                  active={maxPrice === price}
                  onClick={() => setMaxPrice(maxPrice === price ? null : price)}
                >
                  Under {price.toLocaleString()}
                </Chip>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RotateCcw size={12} /> Reset filters
            </button>
          )}
        </div>
      </section>

      <section className="section-padding py-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Filter size={16} className="text-primary" />
            <h2 className="font-display text-xl sm:text-2xl tracking-wider">
              {hasFilters ? "Recommended For You" : "Explore the Collection"}
            </h2>
            <span className="text-muted-foreground text-xs ml-auto">
              {recommendations.length} {recommendations.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-light">
                No fragrances match these preferences yet. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border">
        <ScentQuiz />
      </section>

      <Footer />
    </main>
  );
};

export default AIFinder;
