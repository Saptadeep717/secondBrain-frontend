import { create } from "zustand";

export interface ContentTag {
  name: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  link: string;
  tags: ContentTag[];
  summary?: string;
  contentType: "article" | "youtube" | "twitter" | "unknown";
  status: "pending" | "scraping" | "scraped" | "enriched" | "failed";
  scrapedSuccessfully?: boolean;
  scrapeBlocked?: boolean;
  createdAt: string;
  suggestedTopics?: string[];
  relations?: { contentId: string; relationship: string }[];
}

interface ContentState {
  items: ContentItem[];
  setItems: (items: ContentItem[]) => void;
  addItem: (item: ContentItem) => void;
  updateItem: (id: string, updates: Partial<ContentItem>) => void;
  removeItem: (id: string) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item._id === id ? { ...item, ...updates } : item,
      ),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item._id !== id) })),
}));
