import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  username: string | null;
  isInitialized: boolean;
  setAccessToken: (token: string | null) => void;
  setUsername: (username: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
}

const USERNAME_KEY = "second_brain_username";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  username:
    typeof window !== "undefined" ? localStorage.getItem(USERNAME_KEY) : null,
  isInitialized: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setUsername: (username) => {
    if (typeof window !== "undefined") {
      if (username) {
        localStorage.setItem(USERNAME_KEY, username);
      } else {
        localStorage.removeItem(USERNAME_KEY);
      }
    }
    set({ username });
  },
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USERNAME_KEY);
    }
    set({ accessToken: null, username: null });
  },
}));
