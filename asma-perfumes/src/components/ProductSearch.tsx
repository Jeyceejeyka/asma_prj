import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  products: Product[];
  onResults: (filtered: Product[]) => void;
  placeholder?: string;
}

const ProductSearch = ({ products, onResults, placeholder = "Search by name, notes, or collection…" }: ProductSearchProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);

  useMemo(() => {
    if (!debouncedQuery.trim()) {
      onResults(products);
      return;
    }
    const q = debouncedQuery.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.notes.top.toLowerCase().includes(q) ||
      p.notes.heart.toLowerCase().includes(q) ||
      p.notes.base.toLowerCase().includes(q) ||
      p.grade.toLowerCase().includes(q) ||
      p.season.toLowerCase().includes(q)
    );
    onResults(filtered);
  }, [debouncedQuery, products]);

  return (
    <div className="relative w-full max-w-md">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search fragrances"
        className="w-full bg-card border border-border/40 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
