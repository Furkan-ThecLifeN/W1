// src/Store/useMobileProfileStore.js
import { create } from "zustand";

export const useMobileProfileStore = create((set) => ({
  allData: {
    posts: [],
    feelings: [],
    feeds: [],
    likes: [],
    tags: [],
  },
  postCounts: {
    posts: 0,
    feelings: 0,
    feeds: 0,
  },
  loadedTabs: {},
  setAllData: (tab, data) =>
    set((state) => ({
      allData: { ...state.allData, [tab]: data },
      loadedTabs: { ...state.loadedTabs, [tab]: true },
    })),
  setPostCounts: (counts) => set({ postCounts: counts }),
}));
