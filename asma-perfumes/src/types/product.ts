export interface ScentNotes {
  top: string;
  heart: string;
  base: string;
}

export type PerfumeGrade = "Parfum" | "Eau de Parfum" | "Eau de Toilette" | "Eau de Cologne" | "Extrait";
export type Longevity = "2-4 hours" | "4-6 hours" | "6-8 hours" | "8-12 hours" | "12+ hours";
export type Sillage = "Intimate" | "Moderate" | "Strong" | "Enormous";
export type Season = "Spring" | "Summer" | "Autumn" | "Winter" | "All Seasons";

export interface Product {
  id: number;
  name: string;
  categoryId?: number;
  collection: string;
  price: number;
  sizes: string[];
  notes: ScentNotes;
  description: string;
  image: string;
  grade: PerfumeGrade;
  concentration: string;
  longevity: Longevity;
  sillage: Sillage;
  season: Season;
  gender: "Unisex" | "Masculine" | "Feminine";
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Collection {
  id?: number;
  name: string;
  tagline: string;
  description: string;
  image: string;
}
