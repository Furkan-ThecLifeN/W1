import { create } from "zustand";
import { db, auth } from "../config/firebase-client";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const useServerStore = create((set, get) => ({
  servers: [],
  activeServerId: null,
  serverDetails: {},

  isLoading: false,
  isLoaded: false,
  error: null,

  /* --------------------------------------------------
     KULLANICININ SUNUCULARINI GETİR
  -------------------------------------------------- */
  fetchUserServers: async () => {
    if (get().isLoaded) return;

    set({ isLoading: true, error: null });

    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDocs(
        collection(db, "users", user.uid, "joinedServers")
      );

      const servers = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        icon: doc.data().icon || null,
        role: doc.data().role || "member",
        unread: 0,
        activeVoice: 0,
      }));

      set({
        servers,
        isLoaded: true,
        isLoading: false,
      });
    } catch (err) {
      console.error("Sunucular alınamadı:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  /* --------------------------------------------------
     SUNUCU DETAYLARI (CACHE'Lİ)
  -------------------------------------------------- */
  fetchServerDetails: async (serverId) => {
    if (!serverId) return;

    if (get().serverDetails[serverId]) {
      set({ activeServerId: serverId });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await axios.get(
        `${API_URL}/api/servers/${serverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;

      set((state) => ({
        activeServerId: serverId,
        serverDetails: {
          ...state.serverDetails,
          [serverId]: {
            ...data,
          },
        },
      }));
    } catch (err) {
      console.error("Sunucu detay hatası:", err);
    }
  },

  /* --------------------------------------------------
     YENİ SUNUCU EKLE (CREATE SERVER RESPONSE UYUMLU)
  -------------------------------------------------- */
  addServer: (response) => {
    if (!response?.serverId) return;

    set((state) => ({
      servers: [
        ...state.servers,
        {
          id: response.serverId,
          name: response.name,
          icon: response.icon || null,
          role: "owner",
          unread: 0,
          activeVoice: 0,
        },
      ],
      activeServerId: response.serverId,
      serverDetails: {
        ...state.serverDetails,
        [response.serverId]: {
          channels: response.channels || [],
          roles: response.roles || [],
          permissions: response.permissions || ["ADMIN"],
        },
      },
    }));
  },

  setActiveServer: (serverId) => set({ activeServerId: serverId }),

  reset: () =>
    set({
      servers: [],
      activeServerId: null,
      serverDetails: {},
      isLoaded: false,
      error: null,
    }),
}));
