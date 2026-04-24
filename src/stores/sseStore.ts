import { create } from "zustand";

interface SSEState {
  isConnected: boolean;
  pendingCount: number;
  setConnected: (connected: boolean) => void;
  setPendingCount: (count: number) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  resetPending: () => void;
}

export const useSSEStore = create<SSEState>((set) => ({
  isConnected: false,
  pendingCount: 0,
  setConnected: (connected) => set({ isConnected: connected }),
  setPendingCount: (count) => set({ pendingCount: count }),
  incrementPending: () =>
    set((state) => ({ pendingCount: state.pendingCount + 1 })),
  decrementPending: () =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
  resetPending: () => set({ pendingCount: 0 }),
}));
