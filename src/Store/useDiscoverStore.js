import { create } from "zustand";

export const useDiscoverStore = create((set) => ({
  exploreFeed: [],
  activeTab: "trend",
  isLoaded: false,
  loading: false,

  setState: (newState) => set((state) => ({ ...state, ...newState })),

  reset: () =>
    set({
      exploreFeed: [],
      activeTab: "trend",
      isLoaded: false,
      loading: false,
    }),
}));
