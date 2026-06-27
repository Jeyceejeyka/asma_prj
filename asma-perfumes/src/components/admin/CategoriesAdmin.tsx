// import { useEffect, useState } from "react";
// import { resolveCollectionImage } from "@/lib/assets";
// import { useProductsStore } from "@/store/productsStore";

// const CategoriesAdmin = () => {
//   const { collections, products, fetchAll, loaded } = useProductsStore();
//   useEffect(() => { if (!loaded) fetchAll(); }, [loaded]);

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="font-display text-lg tracking-wider">Categories</h2>
//         <p className="text-xs text-muted-foreground">GET /products/categories/ · {collections.length} total</p>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {collections.map((c) => {
//           const count = products.filter((p) => p.collection === c.name).length;
//           return (
//             <div key={c.name} className="bg-card border border-border/40 rounded-2xl overflow-hidden">
//               <div className="aspect-[16/10] bg-secondary overflow-hidden">
//                 <CategoryImage collection={c} />
//               </div>
//               <div className="p-4">
//                 <h3 className="font-display text-base tracking-wider">{c.name}</h3>
//                 <p className="text-xs text-muted-foreground italic mt-0.5">{c.tagline}</p>
//                 <p className="text-[10px] text-primary mt-2">{count} products</p>
//               </div>
//             </div>
//           );
//         })}
//         {collections.length === 0 && (
//           <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border/40 rounded-2xl">No categories.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CategoriesAdmin;

// const CategoryImage = ({ collection }: { collection: { name: string; image?: string } }) => {
//   const [src, setSrc] = useState(collection.image || resolveCollectionImage(collection.name));

//   return (
//     <img
//       src={src}
//       alt={collection.name}
//       className="w-full h-full object-cover"
//       loading="lazy"
//       onError={() => setSrc(resolveCollectionImage(collection.name))}
//     />
//   );
// };



import { useEffect, useState } from "react";
import { resolveCollectionImage } from "@/lib/assets";
import { useProductsStore } from "@/store/productsStore";
import { ChevronRight, Package } from "lucide-react";

const CategoriesAdmin = () => {
  const { collections, products, fetchAll, loaded } = useProductsStore();

  useEffect(() => {
    if (!loaded) fetchAll();
  }, [loaded]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">
          Categories
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage all product categories and monitor their inventory.
        </p>
      </div>

      <div className="space-y-3">
        {collections.map((c) => {
          const count = products.filter(
            (p) => p.collection === c.name
          ).length;

          return (
            <div
              key={c.name}
              className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
            >
              {/* Image */}
              <div className="h-24 w-24 overflow-hidden rounded-xl bg-secondary flex-shrink-0">
                <CategoryImage collection={c} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-lg font-semibold">
                  {c.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {c.tagline || "No description available."}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex flex-col items-center justify-center rounded-xl bg-secondary px-5 py-3">
                <Package className="mb-1 h-5 w-5 text-primary" />

                <span className="text-xl font-bold">
                  {count}
                </span>

                <span className="text-xs text-muted-foreground">
                  Products
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          );
        })}

        {collections.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">
              No categories available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesAdmin;

const CategoryImage = ({
  collection,
}: {
  collection: {
    name: string;
    image?: string;
  };
}) => {
  const [src, setSrc] = useState(
    collection.image || resolveCollectionImage(collection.name)
  );

  return (
    <img
      src={src}
      alt={collection.name}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setSrc(resolveCollectionImage(collection.name))}
    />
  );
};