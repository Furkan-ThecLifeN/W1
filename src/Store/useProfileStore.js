import { create } from "zustand";

export const useProfileStore = create((set) => ({
  profileData: null,
  posts: [],
  feelings: [],
  feeds: [],
  likes: [],
  tags: [],
  isLoaded: {
    posts: false,
    feelings: false,
    feeds: false,
    likes: false,
    tags: false,
  },
  loading: false,

  setState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () =>
    set({
      profileData: null,
      posts: [],
      feelings: [],
      feeds: [],
      likes: [],
      tags: [],
      isLoaded: {
        posts: false,
        feelings: false,
        feeds: false,
        likes: false,
        tags: false,
      },
      loading: false,
    }),
}));
