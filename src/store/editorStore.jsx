import { create } from 'zustand';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'editor_state';
const ENCRYPTION_KEY = 'your-secret-key'; // In production, use environment variables

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const loadPersistedState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const decrypted = decryptData(stored);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to load persisted state:', error);
      return null;
    }
  }
  return null;
};

export const useEditorStore = create((set, get) => {
  const persistedState = loadPersistedState();

  return {
    code: persistedState?.code || '',
    language: persistedState?.language || 'javascript',
    theme: persistedState?.theme || 'vs-dark',
    fontSize: persistedState?.fontSize || 14,

    setCode: (code) => {
      set({ code });
      const state = get();
      const encrypted = encryptData(JSON.stringify(state));
      localStorage.setItem(STORAGE_KEY, encrypted);
    },

    setLanguage: (language) => set({ language }),
    setTheme: (theme) => set({ theme }),
    setFontSize: (fontSize) => set({ fontSize }),
  };
});