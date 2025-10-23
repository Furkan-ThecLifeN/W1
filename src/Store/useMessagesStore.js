import { create } from "zustand";

export const useMessagesStore = create((set) => ({
  selectedUser: null,
  users: [],             // MessagesLeftBar’da gösterilecek kullanıcılar
  loadingUsers: false,   // LeftBar loading durumu
  errorUsers: null,      // LeftBar hata durumu
  myStatus: "online",    // Aktif kullanıcı durumu

  setState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () =>
    set({
      selectedUser: null,
      users: [],
      loadingUsers: false,
      errorUsers: null,
      myStatus: "online",
    }),
}));
