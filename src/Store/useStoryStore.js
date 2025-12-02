import { create } from "zustand";

export const useStoryStore = create((set, get) => ({
  // --- KİŞİSEL AKIŞ STATE ---
  feed: [],      // Takip edilenlerin hikayeleri
  myStory: null, // Benim hikayem
  loading: false,
  error: null,
  isLoaded: false, // Kişisel akış yüklendi mi?

  // --- PUBLIC (KEŞFET) AKIŞ STATE ---
  publicFeed: [],
  publicLoaded: false, // Public akış yüklendi mi?

  // State güncelleme yardımcısı
  setState: (newState) => set((state) => ({ ...state, ...newState })),

  // ============================================================
  // 1. KİŞİSEL HİKAYELERİ GETİR (Takip Edilenler)
  // ============================================================
  fetchStories: async (currentUser, forceRefresh = false) => {
    if (!currentUser) return;

    const { isLoaded } = get();
    if (isLoaded && !forceRefresh) return; // Cache varsa istek atma

    set({ loading: true, error: null });

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Hikayeler çekilemedi");
      
      const data = await res.json();
      
      if (data.feed) {
        const myOwnStoryGroup = data.feed.find(item => item.user.uid === currentUser.uid);
        const othersStories = data.feed.filter(item => item.user.uid !== currentUser.uid);

        set({ 
            feed: othersStories, 
            myStory: myOwnStoryGroup || null,
            loading: false,
            isLoaded: true
        });
      } else {
        set({ feed: [], myStory: null, loading: false, isLoaded: true });
      }

    } catch (error) {
      console.error("Story fetch error:", error);
      set({ error: error.message, loading: false });
    }
  },

  // ============================================================
  // 2. PUBLIC HİKAYELERİ GETİR (Keşfet / Ana Sayfa)
  // ============================================================
  fetchPublicStories: async (currentUser, forceRefresh = false) => {
    // Public olduğu için currentUser zorunlu olmayabilir ama token için lazım
    if (!currentUser) return;

    const { publicLoaded } = get();
    if (publicLoaded && !forceRefresh) return; // Cache varsa istek atma

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/public-feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Public hikayeler çekilemedi");

      const data = await res.json();
      
      // Public feed güvenli atama
      set({ publicFeed: data.feed || [], publicLoaded: true });

    } catch (error) {
      console.error("Public story fetch error:", error);
      set({ publicFeed: [], publicLoaded: true }); // Hata olsa da loaded true yap ki döngüye girmesin
    }
  },

  // ============================================================
  // 3. HİKAYEYİ GÖRÜLDÜ İŞARETLE (Kişisel Akış İçin)
  // ============================================================
  markAsSeen: async (storyId, targetUserId, currentUser) => {
    const { feed, myStory } = get();

    // -- A) Kendi hikayemse --
    if (targetUserId === currentUser.uid && myStory) {
        const updatedStories = myStory.stories.map(s => 
            s.id === storyId ? { ...s, seen: true } : s
        );
        const allSeen = updatedStories.every(s => s.seen);
        set({ myStory: { ...myStory, stories: updatedStories, allSeen } });
    } 
    // -- B) Başkasının hikayesiyse (Kişisel Feed) --
    else {
        const updatedFeed = feed.map(group => {
            if (group.user.uid === targetUserId) {
                const newStories = group.stories.map(s => 
                    s.id === storyId ? { ...s, seen: true } : s
                );
                const allSeen = newStories.every(s => s.seen);
                return { ...group, stories: newStories, allSeen };
            }
            return group;
        });
        set({ feed: updatedFeed });
    }

    // Backend İsteği
    try {
        const token = await currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_URL}/api/stories/${storyId}/view`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (e) { console.error("Görüldü hatası:", e); }
  },

  // ============================================================
  // 4. PUBLIC HİKAYEYİ GÖRÜLDÜ İŞARETLE (Keşfet Akışı İçin)
  // ============================================================
  markPublicAsSeen: async (storyId, targetUserId, currentUser) => {
    const { publicFeed } = get();

    // Public feed içindeki durumu güncelle (Rengi gri yapmak için)
    const updatedPublicFeed = publicFeed.map(group => {
        if (group.user.uid === targetUserId) {
            const newStories = group.stories.map(s => 
                s.id === storyId ? { ...s, seen: true } : s
            );
            const allSeen = newStories.every(s => s.seen);
            return { ...group, stories: newStories, allSeen };
        }
        return group;
    });

    set({ publicFeed: updatedPublicFeed });

    // Backend İsteği (Aynı endpoint kullanılır)
    try {
        const token = await currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_URL}/api/stories/${storyId}/view`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (e) { console.error("Public görüldü hatası:", e); }
  },

  // ============================================================
  // 5. YENİ HİKAYE EKLEME (Local)
  // ============================================================
  addMyStoryLocally: (newStory, currentUser) => {
    set((state) => {
        const existingGroup = state.myStory;
        const updatedGroup = existingGroup 
            ? { ...existingGroup, stories: [...existingGroup.stories, newStory], allSeen: false }
            : { 
                user: { 
                    uid: currentUser.uid, 
                    displayName: currentUser.displayName, 
                    photoURL: currentUser.photoURL,
                    username: currentUser.username 
                }, 
                stories: [newStory],
                allSeen: false 
              };
        return { myStory: updatedGroup };
    });
  },

  // Reset (Logout)
  reset: () => set({ 
      feed: [], myStory: null, isLoaded: false, 
      publicFeed: [], publicLoaded: false,
      loading: false, error: null 
  }),
}));