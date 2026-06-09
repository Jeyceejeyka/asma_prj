import { useEffect, useState } from "react";
import { resolveCollectionImage } from "@/lib/assets";
import { useProductsStore } from "@/store/productsStore";

const CategoriesAdmin = () => {
  const { collections, products, fetchAll, loaded } = useProductsStore();
  useEffect(() => { if (!loaded) fetchAll(); }, [loaded]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg tracking-wider">Categories</h2>
        <p className="text-xs text-muted-foreground">GET /products/categories/ · {collections.length} total</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => {
          const count = products.filter((p) => p.collection === c.name).length;
          return (
            <div key={c.name} className="bg-card border border-border/40 rounded-2xl overflow-hidden">
              <div className="aspect-[16/10] bg-secondary overflow-hidden">
                <CategoryImage collection={c} />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base tracking-wider">{c.name}</h3>
                <p className="text-xs text-muted-foreground italic mt-0.5">{c.tagline}</p>
                <p className="text-[10px] text-primary mt-2">{count} products</p>
              </div>
            </div>
          );
        })}
        {collections.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border/40 rounded-2xl">No categories.</div>
        )}
      </div>
    </div>
  );
};

export default CategoriesAdmin;

const CategoryImage = ({ collection }: { collection: { name: string; image?: string } }) => {
  const [src, setSrc] = useState(collection.image || resolveCollectionImage(collection.name));

  return (
    <img
      src={src}
      alt={collection.name}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setSrc(resolveCollectionImage(collection.name))}
    />
  );
};
