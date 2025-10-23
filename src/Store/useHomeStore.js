// src/store/useHomeStore.js
import { create } from "zustand";

export const useHomeStore = create((set) => ({
  activeView: "json",
  firebaseFeed: [],
  jsonFeed: [],
  postsExhausted: false,
  feelingsExhausted: false,
  jsonExhausted: false,
  initialLoadDone: { json: false, firebase: false },
  loading: false,

  setState: (newState) => set((state) => ({ ...state, ...newState })),

  reset: () =>
    set({
      activeView: "json",
      firebaseFeed: [],
      jsonFeed: [],
      postsExhausted: false,
      feelingsExhausted: false,
      jsonExhausted: false,
      initialLoadDone: { json: false, firebase: false },
      loading: false,
    }),
}));
