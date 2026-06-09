// Lightweight hook + helpers used across the app to consume the products store.
// Real data is loaded from the backend via useProductsStore.

import { useEffect } from "react";
import { useProductsStore } from "@/store/productsStore";

export const useCatalog = () => {
  const products = useProductsStore((s) => s.products);
  const collections = useProductsStore((s) => s.collections);
  const loading = useProductsStore((s) => s.loading);
  const loaded = useProductsStore((s) => s.loaded);
  const error = useProductsStore((s) => s.error);
  const fetchAll = useProductsStore((s) => s.fetchAll);

  useEffect(() => {
    if (!loaded && !loading) fetchAll();
  }, [loaded, loading, fetchAll]);

  return { products, collections, loading, loaded, error };
};
