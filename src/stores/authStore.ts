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
const TOKEN_KEY = "second_brain_token";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken:
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  username:
    typeof window !== "undefined" ? localStorage.getItem(USERNAME_KEY) : null,
  isInitialized: false,
  setAccessToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    set({ accessToken: token });
  },
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
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ accessToken: null, username: null });
  },
}));
