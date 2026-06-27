import { create } from "zustand";
import { api } from "@/lib/api";
import { useProductsStore } from "@/store/productsStore";
import type { CartItem, Product } from "@/types/product";

interface RawCartItem {
  id?: number;
  product?: any;
  product_id?: number;
  size?: string;
  quantity: number;
  price?: number | string;
}

interface RawCart {
  items?: RawCartItem[];
  results?: RawCartItem[];
  total?: number | string;
  total_price?: number | string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  fetchCart: () => Promise<void>;
  addItem: (product: Product, size: string, quantity?: number) => Promise<void>;
  removeItem: (productId: number, size: string) => Promise<void>;
  updateQuantity: (productId: number, size: string, quantity: number) => Promise<void>;
  updateItemById: (itemId: number, payload: { quantity?: number; size?: string }) => Promise<void>;
  removeItemById: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (payload?: any) => Promise<any>;

  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  hasItem: (productId: number, size: string) => boolean;
}

const normalizeItems = (raw: RawCart): CartItem[] => {
  const list = raw.items || raw.results || [];
  const productsById = new Map(useProductsStore.getState().products.map((p) => [p.id, p]));
  return list
    .map((it) => {
      const productData = it.product;
      const productId =
        typeof productData === "object" && productData
          ? productData.id
          : it.product_id ?? (typeof productData === "number" ? productData : 0);
      let product = productsById.get(productId);
      if (!product && typeof productData === "object" && productData) {
        // Best-effort minimal product representation
        product = {
          id: productData.id,
          name: productData.name || productData.product_name || `Product ${productId}`,
          collection:
            productData.collection?.name ||
            productData.collection ||
            productData.category_name ||
            "",
          price: Number(productData.price ?? it.price ?? 0),
          sizes: productData.sizes || [it.size || "50ml"],
          notes: { top: "", heart: "", base: "" },
          description: productData.description || "",
          image: productData.image_url || productData.image || "",
          grade: productData.grade || "Eau de Parfum",
          concentration: productData.concentration || "",
          longevity: productData.longevity || "6-8 hours",
          sillage: productData.sillage || "Moderate",
          season: productData.season || "All Seasons",
          gender: productData.gender || "Unisex",
        } as Product;
      }
      if (!product) return null;
      return { product, size: it.size || product.sizes[0], quantity: it.quantity };
    })
    .filter(Boolean) as CartItem[];
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  loading: false,
  error: null,
  hydrated: false,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      // Ensure products loaded so we can hydrate items with rich Product data.
      await useProductsStore.getState().fetchAll();
      const data = await api<RawCart>("/cart/");
      set({ items: normalizeItems(data), hydrated: true, loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load cart", loading: false, hydrated: true });
    }
  },

  addItem: async (product, size, quantity = 1) => {
    await api("/cart/add/", {
      method: "POST",
      body: { product_id: product.id, size, quantity },
    });
    await get().fetchCart();
  },

  removeItem: async (productId) => {
    await api(`/cart/remove/${productId}/`, { method: "DELETE" });
    await get().fetchCart();
  },

  updateQuantity: async (productId, size, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId, size);
      return;
    }
    const current = get().items.find((i) => i.product.id === productId && i.size === size);
    const delta = quantity - (current?.quantity || 0);
    if (delta === 0) return;
    if (delta > 0) {
      await api("/cart/add/", {
        method: "POST",
        body: { product_id: productId, size, quantity: delta },
      });
    } else {
      // Backend remove deletes the line entirely; re-add the new total.
      await api(`/cart/remove/${productId}/`, { method: "DELETE" });
      if (quantity > 0) {
        await api("/cart/add/", {
          method: "POST",
          body: { product_id: productId, size, quantity },
        });
      }
    }
    await get().fetchCart();
  },

  updateItemById: async (itemId, payload) => {
    await api(`/cart/item/${itemId}/`, { method: "PATCH", body: payload });
    await get().fetchCart();
  },

  removeItemById: async (itemId) => {
    await api(`/cart/item/${itemId}/`, { method: "DELETE" });
    await get().fetchCart();
  },

  clearCart: async () => {
    await api("/cart/clear/", { method: "POST" }).catch(() =>
      api("/cart/clear/", { method: "DELETE" })
    );
    set({ items: [] });
  },

  checkout: async (payload) => {
    // Backend requires Idempotency-Key per checkout attempt to safely
    // de-duplicate retries (network/STK push retries).
    const idempotencyKey =
      (globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    console.log("src/store/cartStore.ts: cartStore.checkout payload=", payload, "idempotencyKey=", idempotencyKey);
    const data = await api<any>("/cart/checkout/", {
      method: "POST",
      body: payload ?? {},
      headers: { "Idempotency-Key": idempotencyKey },
    });
    console.log("src/store/cartStore.ts: cartStore.checkout response=", data);
    await get().fetchCart();
    return data;
  },

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
  hasItem: (productId, size) =>
    get().items.some((i) => i.product.id === productId && i.size === size),
}));
