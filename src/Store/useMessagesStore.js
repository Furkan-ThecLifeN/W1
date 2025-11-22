import { create } from "zustand";

export const useMessagesStore = create((set, get) => ({
  selectedUser: null,
  users: [],
  loadingUsers: false,
  errorUsers: null,
  
  // Mesaj Önbelleği: { "uid1_uid2": { messages: [], lastDoc: null, hasMore: true } }
  conversationsCache: {},

  setSelectedUser: (user) => set({ selectedUser: user }),

  setUsers: (users) => set({ users, loadingUsers: false, errorUsers: null }),
  setLoading: (loading) => set({ loadingUsers: loading }),
  setError: (error) => set({ errorUsers: error, loadingUsers: false }),

  setMessages: (conversationId, messages, lastDoc = null, hasMore = true) => {
    set((state) => ({
      conversationsCache: {
        ...state.conversationsCache,
        [conversationId]: {
          messages: messages,
          lastDoc: lastDoc || state.conversationsCache[conversationId]?.lastDoc,
          hasMore: hasMore
        },
      },
    }));
  },

  prependMessages: (conversationId, newMessages, lastDoc, hasMore) => {
    set((state) => {
      const currentData = state.conversationsCache[conversationId] || { messages: [] };
      const existingIds = new Set(currentData.messages.map(m => m.id));
      const filteredNew = newMessages.filter(m => !existingIds.has(m.id));

      return {
        conversationsCache: {
          ...state.conversationsCache,
          [conversationId]: {
            messages: [...filteredNew, ...currentData.messages],
            lastDoc: lastDoc,
            hasMore: hasMore,
          },
        },
      };
    });
  },

  addMessage: (conversationId, message) => {
    set((state) => {
        const currentData = state.conversationsCache[conversationId] || { messages: [] };
        if (currentData.messages.some(m => m.id === message.id)) return {};

        return {
            conversationsCache: {
                ...state.conversationsCache,
                [conversationId]: {
                    ...currentData,
                    messages: [...currentData.messages, message]
                }
            }
        }
    })
  },

  // ✅ YENİ: Sohbeti Temizle
  clearConversation: (conversationId) => {
    set((state) => ({
        conversationsCache: {
            ...state.conversationsCache,
            [conversationId]: {
                messages: [],
                lastDoc: null,
                hasMore: false
            }
        }
    }));
  },

  reset: () =>
    set({
      selectedUser: null,
      users: [],
      loadingUsers: false,
      errorUsers: null,
      conversationsCache: {},
    }),
}));