import { create } from 'zustand';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'editor_state';
const ENCRYPTION_KEY = 'your-secret-key';

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
    openedFolder: null,
    openedFiles: [],
    openedFile: null,
    showTerminal: false, // Add this state

    setCode: (code) => {
      set({ code });
    },

    setLanguage: (language) => set({ language }),
    setTheme: (theme) => set({ theme }),
    setFontSize: (fontSize) => set({ fontSize }),

    toggleTerminal: () => {
      set((state) => ({ showTerminal: !state.showTerminal })); // Toggle terminal visibility
    },

    openFolder: async () => {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const files = [];

        for await (const entry of dirHandle.values()) {
          files.push({
            name: entry.name,
            path: entry.name,
            handle: entry,
            isDirectory: entry.kind === 'directory',
            children: entry.kind === 'directory' ? [] : null,
          });
        }

        set({ openedFolder: dirHandle, openedFiles: files, openedFile: null });
      } catch (error) {
        console.error('Error opening folder:', error);
      }
    },

    openFile: async (file) => {
      if (!file || !file.handle) return;

      try {
        const fileContent = await file.handle.getFile();
        const text = await fileContent.text();

        set({ openedFile: file, code: text });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    },

    saveFile: async () => {
      const { openedFile, code } = get();
      if (!openedFile || !openedFile.handle) {
        alert('No file selected!');
        return;
      }

      try {
        const writable = await openedFile.handle.createWritable();
        await writable.write(code);
        await writable.close();
        alert('File saved successfully!');
      } catch (error) {
        console.error('Error saving file:', error);
      }
    },
  };
});