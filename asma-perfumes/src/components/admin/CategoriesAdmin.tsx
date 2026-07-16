// import { useEffect, useState } from "react";
// import { resolveCollectionImage } from "@/lib/assets";
// import { useProductsStore } from "@/store/productsStore";
// import { ChevronRight, Package } from "lucide-react";

// const CategoriesAdmin = () => {
//   const { collections, products, fetchAll, loaded } = useProductsStore();

//   useEffect(() => {
//     if (!loaded) fetchAll();
//   }, [loaded]);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="font-display text-2xl font-semibold">
//           Categories
//         </h2>

//         <p className="mt-1 text-sm text-muted-foreground">
//           Manage all product categories and monitor their inventory.
//         </p>
//       </div>

//       <div className="space-y-3">
//         {collections.map((c) => {
//           const count = products.filter(
//             (p) => p.collection === c.name
//           ).length;

//           return (
//             <div
//               key={c.name}
//               className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
//             >
//               {/* Image */}
//               <div className="h-24 w-24 overflow-hidden rounded-xl bg-secondary flex-shrink-0">
//                 <CategoryImage collection={c} />
//               </div>

//               {/* Content */}
//               <div className="flex-1 min-w-0">
//                 <h3 className="truncate text-lg font-semibold">
//                   {c.name}
//                 </h3>

//                 <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
//                   {c.tagline || "No description available."}
//                 </p>
//               </div>

//               {/* Stats */}
//               <div className="hidden md:flex flex-col items-center justify-center rounded-xl bg-secondary px-5 py-3">
//                 <Package className="mb-1 h-5 w-5 text-primary" />

//                 <span className="text-xl font-bold">
//                   {count}
//                 </span>

//                 <span className="text-xs text-muted-foreground">
//                   Products
//                 </span>
//               </div>

//               {/* Arrow */}
//               <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
//             </div>
//           );
//         })}

//         {collections.length === 0 && (
//           <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
//             <p className="text-sm text-muted-foreground">
//               No categories available.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CategoriesAdmin;

// const CategoryImage = ({
//   collection,
// }: {
//   collection: {
//     name: string;
//     image?: string;
//   };
// }) => {
//   const [src, setSrc] = useState(
//     collection.image || resolveCollectionImage(collection.name)
//   );

//   return (
//     <img
//       src={src}
//       alt={collection.name}
//       loading="lazy"
//       className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//       onError={() => setSrc(resolveCollectionImage(collection.name))}
//     />
//   );
// };


import { useEffect, useState } from "react";
import { resolveCollectionImage } from "@/lib/assets";
import { useProductsStore } from "@/store/productsStore";
import type { Collection, Product } from "@/types/product";
import { ArrowLeft, Package } from "lucide-react";

const CategoriesAdmin = () => {
  const [selected, setSelected] = useState<Collection | null>(null);

  return selected ? (
    <CategoryDetail collection={selected} onBack={() => setSelected(null)} />
  ) : (
    <CategoryList onSelect={setSelected} />
  );
};

export default CategoriesAdmin;

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

const CategoryList = ({ onSelect }: { onSelect: (c: Collection) => void }) => {
  const { collections, products, fetchAll, loaded, loading, error } = useProductsStore();

  useEffect(() => {
    if (!loaded) fetchAll();
  }, [loaded]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {collections.length} categor{collections.length === 1 ? "y" : "ies"} · GET /products/categories/
        </p>
      </div>

      {loading && !loaded ? (
        <TableSkeleton />
      ) : error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 text-center">
          <p className="text-sm text-destructive">Couldn't load categories.</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
          <p className="text-sm text-muted-foreground">No categories available.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-20 px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((c) => {
                const count = products.filter((p) => p.collection === c.name).length;

                return (
                  <tr
                    key={c.id ?? c.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(c);
                      }
                    }}
                    className="cursor-pointer bg-card outline-none transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40"
                  >
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                        <CategoryImage collection={c} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {'This is categorized under ' + c.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        {count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Detail view — products within the selected category
// ---------------------------------------------------------------------------

const CategoryDetail = ({
  collection,
  onBack,
}: {
  collection: Collection;
  onBack: () => void;
}) => {
  const { products } = useProductsStore();
  const categoryProducts = products.filter((p) => p.collection === collection.name);
  const productsImage = categoryProducts.slice(0, 1).map((p) => p.image);
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </button>

      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
          <img
            src={productsImage[0]}
            // src={collection.image || productsImage[0] || resolveCollectionImage(collection.name)}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">{collection.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {'category ' + collection.name || "No description available."}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {categoryProducts.length} product{categoryProducts.length === 1 ? "" : "s"} in this category
        </p>

        {categoryProducts.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">No products in this category yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-20 px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Sizes</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryProducts.map((p) => (
                  <tr key={p.id} className="bg-card">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.grade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sizes.join(", ")}</td>
                    <td className="px-4 py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const CategoryImage = ({ collection }: { collection: Collection }) => {
  const { products } = useProductsStore();
  const categoryProducts = products.filter((p) => p.collection === collection.name);
  const productsImage = categoryProducts.slice(0, 1).map((p) => p.image);

  const [src, setSrc] = useState(productsImage[0] || resolveCollectionImage(collection.name));

  return (
    <img
      src={src}
      alt={collection.name}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setSrc(resolveCollectionImage(collection.name))}
    />
  );
};

const TableSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
          <th className="w-20 px-4 py-3 font-medium">Image</th>
          <th className="px-4 py-3 font-medium">Name</th>
          <th className="px-4 py-3 font-medium">Description</th>
          <th className="px-4 py-3 text-right font-medium">Products</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="bg-card">
            <td className="px-4 py-3">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-secondary" />
            </td>
            <td className="px-4 py-3">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            </td>
            <td className="px-4 py-3">
              <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
            </td>
            <td className="px-4 py-3 text-right">
              <div className="ml-auto h-4 w-10 animate-pulse rounded bg-secondary" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);