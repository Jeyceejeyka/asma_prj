import { create } from "zustand";

interface WishlistState {
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  count: () => number;
}

const STORAGE_KEY = "asma-wishlist";

const loadIds = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: loadIds(),
  toggle: (id) =>
    set((state) => {
      const next = state.ids.includes(id)
        ? state.ids.filter((i) => i !== id)
        : [...state.ids, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { ids: next };
    }),
  has: (id) => get().ids.includes(id),
  count: () => get().ids.length,
}));
