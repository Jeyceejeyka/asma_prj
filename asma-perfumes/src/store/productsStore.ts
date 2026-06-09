import { create } from "zustand";
import { api } from "@/lib/api";
import { resolveBottleImage, resolveCollectionImage } from "@/lib/assets";
import type { Product, Collection } from "@/types/product";

interface RawProduct {
  id: number;
  name?: string;
  product_name?: string;
  collection?: string | { id?: number; name?: string; category_name?: string };
  category?:
    | number
    | string
    | { id?: number; name?: string; category_name?: string };
  category_name?: string;
  price: number | string;
  sizes?: string[];
  notes?: { top?: string; heart?: string; base?: string };
  description?: string;
  image?: string;
  image_url?: string;
  image_key?: string;
  imageKey?: string;
  grade?: string;
  concentration?: string;
  longevity?: string;
  sillage?: string;
  season?: string;
  gender?: string;
}

interface RawCategory {
  id?: number;
  name?: string;
  category_name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  image?: string;
  image_url?: string;
}

const normalizeProduct = (p: RawProduct): Product => {
  const productName = p.name || p.product_name || "";
  const collectionName =
    typeof p.collection === "string"
      ? p.collection
      : (p.collection as any)?.name ||
        (p.collection as any)?.category_name ||
        (typeof p.category === "string" ? p.category : (p.category as any)?.name) ||
        (p.category as any)?.category_name ||
        p.category_name ||
        "";
  const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["50ml"];
  const imageKey = p.image_key || p.imageKey;
  const categoryId =
    typeof p.category === "number"
      ? p.category
      : typeof p.category === "string"
      ? undefined
      : (p.category as any)?.id;

  return {
    id: p.id,
    name: productName,
    categoryId,
    collection: collectionName,
    price: typeof p.price === "string" ? Number(p.price) : p.price,
    sizes,
    notes: {
      top: p.notes?.top || "",
      heart: p.notes?.heart || "",
      base: p.notes?.base || "",
    },
    description: p.description || "",
    image: resolveBottleImage(productName, imageKey, p.image || p.image_url),
    grade: (p.grade as Product["grade"]) || "Eau de Parfum",
    concentration: p.concentration || "",
    longevity: (p.longevity as Product["longevity"]) || "6-8 hours",
    sillage: (p.sillage as Product["sillage"]) || "Moderate",
    season: (p.season as Product["season"]) || "All Seasons",
    gender: (p.gender as Product["gender"]) || "Unisex",
  };
};

const normalizeCollection = (c: RawCategory): Collection => {
  const name = c.name || c.category_name || "";
  return {
    id: c.id,
    name,
    tagline: c.tagline || "",
    description: c.description || "",
    image: resolveCollectionImage(name, c.image || c.image_url),
  };
};

function toBackendProductPayload(payload: any, collections: Collection[]): any {
  const backendPayload = { ...payload };

  if (backendPayload.name !== undefined) {
    backendPayload.product_name = backendPayload.name;
    delete backendPayload.name;
  }

  // Only set image_url if it's a valid URL (starts with http); otherwise omit it
  // File uploads are handled by toFormDataIfFile separately
  if (backendPayload.image !== undefined) {
    const imageVal = backendPayload.image;
    if (typeof imageVal === "string") {
      if (imageVal.startsWith("http")) {
        backendPayload.image_url = imageVal;
      }
      delete backendPayload.image;
    } else if (imageVal === null || imageVal === "") {
      delete backendPayload.image;
    }
  }

  if (backendPayload.categoryId !== undefined) {
    backendPayload.category = Number(backendPayload.categoryId);
    delete backendPayload.categoryId;
  } else if (backendPayload.collection !== undefined) {
    const collection = backendPayload.collection;
    delete backendPayload.collection;

    const matchingCategory = collection
      ? collections.find((c) => c.name.toLowerCase() === String(collection).toLowerCase())
      : undefined;

    if (matchingCategory?.id) {
      backendPayload.category = matchingCategory.id;
    }
  }

  return backendPayload;
}

interface ProductsState {
  products: Product[];
  collections: Collection[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  refresh: () => Promise<void>;
  getProduct: (id: number) => Promise<Product>;
  getById: (id: number) => Product | undefined;
  byCollection: (name: string) => Product[];
  // Extra catalog endpoints
  fetchByCategory: (categoryId: number | string) => Promise<Product[]>;
  fetchInStock: () => Promise<Product[]>;
  fetchPriceRange: (params?: { min?: number; max?: number }) => Promise<Product[]>;
  searchProducts: (q: string) => Promise<Product[]>;
  searchCategories: (q: string) => Promise<Collection[]>;
  getCategory: (id: number | string) => Promise<Collection>;
  // Admin
  adminCreate: (payload: any) => Promise<Product>;
  adminUpdate: (id: number, payload: any) => Promise<Product>;
  adminDelete: (id: number) => Promise<void>;
}

const unwrap = <T,>(d: any): T[] =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  collections: [],
  loaded: false,
  loading: false,
  error: null,

  fetchAll: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const [pRes, cRes] = await Promise.all([
        api<any>("/products/products/", { auth: false }),
        api<any>("/products/categories/", { auth: false }),
      ]);
      set({
        products: unwrap<RawProduct>(pRes).map(normalizeProduct),
        collections: unwrap<RawCategory>(cRes).map(normalizeCollection),
        loaded: true,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message || "Failed to load catalog", loading: false });
    }
  },

  refresh: async () => {
    set({ loaded: false });
    await get().fetchAll();
  },

  getProduct: async (id) => {
    const cached = get().products.find((p) => p.id === id);
    if (cached) return cached;
    const data = await api<RawProduct>(`/products/products/${id}/`, { auth: false });
    const product = normalizeProduct(data);
    set({ products: [...get().products, product] });
    return product;
  },

  getById: (id) => get().products.find((p) => p.id === id),
  byCollection: (name) => get().products.filter((p) => p.collection === name),

  fetchByCategory: async (categoryId) => {
    const data = await api<any>(`/products/products/category/${categoryId}/`, { auth: false });
    return unwrap<RawProduct>(data).map(normalizeProduct);
  },

  fetchInStock: async () => {
    const data = await api<any>("/products/products/in_stock/", { auth: false });
    return unwrap<RawProduct>(data).map(normalizeProduct);
  },

  fetchPriceRange: async (params) => {
    const qs = new URLSearchParams();
    if (params?.min !== undefined) qs.set("min", String(params.min));
    if (params?.max !== undefined) qs.set("max", String(params.max));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const data = await api<any>(`/products/products/price_range/${suffix}`, { auth: false });
    return unwrap<RawProduct>(data).map(normalizeProduct);
  },

  searchProducts: async (q) => {
    const data = await api<any>(`/products/products/search/?q=${encodeURIComponent(q)}`, { auth: false });
    return unwrap<RawProduct>(data).map(normalizeProduct);
  },

  searchCategories: async (q) => {
    const data = await api<any>(`/products/categories/search/?q=${encodeURIComponent(q)}`, { auth: false });
    return unwrap<RawCategory>(data).map(normalizeCollection);
  },

  getCategory: async (id) => {
    const data = await api<RawCategory>(`/products/categories/${id}/`, { auth: false });
    return normalizeCollection(data);
  },

  adminCreate: async (payload) => {
    const body = toFormDataIfFile(toBackendProductPayload(payload, get().collections));
    const data = await api<RawProduct>("/products/products/", { method: "POST", body });
    const product = normalizeProduct(data);
    set({ products: [product, ...get().products] });
    return product;
  },

  adminUpdate: async (id, payload) => {
    const body = toFormDataIfFile(toBackendProductPayload(payload, get().collections));
    const method = body instanceof FormData ? "PATCH" : "PATCH";
    const data = await api<RawProduct>(`/products/products/${id}/`, { method, body });
    const product = normalizeProduct(data);
    set({ products: get().products.map((p) => (p.id === id ? product : p)) });
    return product;
  },

  adminDelete: async (id) => {
    await api(`/products/products/${id}/`, { method: "DELETE" });
    set({ products: get().products.filter((p) => p.id !== id) });
  },
}));

// If the payload contains a File, send as multipart/form-data so the backend
// can persist the uploaded image. Otherwise send as JSON.
function toFormDataIfFile(payload: any): any {
  const hasFile =
    payload && Object.values(payload).some((v) => v instanceof File);
  if (!hasFile) return payload;
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof File) fd.append(k, v);
    else if (Array.isArray(v)) v.forEach((item) => fd.append(k, String(item)));
    else fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  });
  return fd;
}
