// DEPRECATED: This module previously held local mock data. The catalog is now
// fetched from the backend. Use `useCatalog()` or `useProductsStore` instead.
//
// Asset resolution helpers were moved to `@/lib/assets`.
import { resolveBottleImage, resolveCollectionImage } from "@/lib/assets";

export { resolveBottleImage, resolveCollectionImage };

// Image maps are kept here only for historical compatibility — components
// should call `resolveCollectionImage(name)` instead.
import collectionMidnight from "@/assets/collection-midnight.jpg";
import collectionVelvet from "@/assets/collection-velvet.jpg";
import collectionAmber from "@/assets/collection-amber.jpg";
import collectionFresh from "@/assets/collection-fresh.jpg";

export const collectionImages: Record<string, string> = {
  "Midnight Oud": collectionMidnight,
  "Velvet Rose": collectionVelvet,
  "Amber Noir": collectionAmber,
  "Fresh Waters": collectionFresh,
};
