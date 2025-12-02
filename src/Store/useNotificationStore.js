import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoaded: false,
      loading: false,

      setState: (newState) => set((state) => ({ ...state, ...newState })),

      reset: () =>
        set({
          notifications: [],
          unreadCount: 0,
          isLoaded: false,
          loading: false,
        }),
    }),

    {
      name: "notification-store",

      // 🔥 sadece notifications kaydedilecek
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
