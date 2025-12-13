import { create } from "zustand";
import { db, auth } from "../config/firebase-client"; 
import { collection, getDocs } from "firebase/firestore";
import axios from "axios"; 

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const useServerStore = create((set, get) => ({
  servers: [], 
  activeServerId: null, 
  serverDetails: {}, // Cache: { "serverID": { channels: [] } }
  
  isLoading: false,
  isLoaded: false, 
  error: null,

  fetchUserServers: async () => {
    if (get().isLoaded) return; // Cache varsa tekrar okuma yapma
    set({ isLoading: true, error: null });

    try {
      const user = auth.currentUser;
      if (!user) return;

      const querySnapshot = await getDocs(collection(db, "users", user.uid, "joinedServers"));
      
      const userServers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        activeVoice: 0,
        unread: 0 
      }));

      set({ servers: userServers, isLoaded: true, isLoading: false });

    } catch (error) {
      console.error("Sunucular yüklenirken hata:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ✅ Sunucu Detaylarını Çeken Fonksiyon
  fetchServerDetails: async (serverId) => {
    // 1. CACHE KONTROLÜ: Eğer veri zaten varsa API'ye gitme (0 Maliyet)
    if (get().serverDetails[serverId]) {
      set({ activeServerId: serverId });
      return;
    }

    try {
      // Token Al
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      // 2. BACKEND İSTEĞİ (Artık 404 vermeyecek)
      const response = await axios.get(`${API_URL}/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fullData = response.data; 

      // 3. STORE GÜNCELLEME (Cache'e ekle)
      set((state) => ({
        activeServerId: serverId,
        serverDetails: {
          ...state.serverDetails,
          [serverId]: fullData 
        }
      }));

    } catch (error) {
      console.error("Sunucu detayları alınamadı:", error);
    }
  },

  addServer: (newServer) => {
    set((state) => ({
      servers: [...state.servers, {
        id: newServer.serverId, 
        name: newServer.server.name,
        img: newServer.server.icon || null, 
        activeVoice: 0,
        unread: 0,
        role: "owner"
      }],
      activeServerId: newServer.serverId,
      serverDetails: {
        ...state.serverDetails,
        [newServer.serverId]: {
          channels: newServer.channels || [] 
        }
      }
    }));
  },

  setActiveServer: (serverId) => set({ activeServerId: serverId }),
  reset: () => set({ servers: [], isLoaded: false, activeServerId: null, serverDetails: {} })
}));