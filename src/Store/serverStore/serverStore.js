import { create } from "zustand";

const useServerStore = create((set) => ({
  activeServerId: null,
  setActiveServerId: (id) => set({ activeServerId: id }),
}));

export default useServerStore;
