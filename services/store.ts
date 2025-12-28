
// [AI UPDATE] Gestion d'état global
// Connecté au fichier de configuration pour les clés API

import { create } from 'zustand';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { User, Profile, Movie } from '../types';
import { MOCK_USER, MOCK_MOVIES } from './mockData';
import { config } from '../config';

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

interface AppState {
  user: User;
  currentProfile: Profile | null;
  myList: string[];
  viewHistory: string[];
  viewProgress: Record<string, { time: number; duration: number }>; // Mapping: profileId_movieId -> {time, duration}
  customContent: Movie[];
  isAuthenticated: boolean;
  playlists: Playlist[];

  // Global Player State
  activeTrack: Movie | null;
  isPlaying: boolean;

  // Actions
  login: (email: string) => void;
  logout: () => void;
  selectProfile: (profile: Profile | null) => void;
  updateProfile: (id: string, name: string, avatar: string) => void;
  addProfile: (name: string, avatar: string) => void;
  addToMyList: (movieId: string) => void;
  removeFromMyList: (movieId: string) => void;
  isInMyList: (movieId: string) => boolean;
  addToHistory: (movieId: string) => void;
  saveProgress: (movieId: string, time: number, duration: number) => void;
  getProgress: (movieId: string) => { time: number; duration: number } | null;
  addCustomMedia: (media: Movie, file?: File | Blob) => Promise<void>;
  removeCustomMedia: (mediaId: string) => Promise<void>;
  initCustomContent: () => Promise<void>;
  setActiveTrack: (track: Movie | null) => void;
  setIsPlaying: (playing: boolean) => void;

  // Playlist Actions
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;

  openaiKey: string;
  setOpenaiKey: (key: string) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  aiProvider: 'gemini' | 'openai';
  setAiProvider: (provider: 'gemini' | 'openai') => void;

  // UI State
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'myflix_v3_content';
const PROFILES_KEY = 'myflix_v3_profiles';

// Charger les profils depuis le local storage ou utiliser les mocks par défaut
const savedProfiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || 'null');
const initialUser: User = {
  ...MOCK_USER,
  profiles: savedProfiles || MOCK_USER.profiles
};

const PLAYLISTS_KEY = 'myflix_playlists';
const savedPlaylists = JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]');

export const useStore = create<AppState>((set, get) => ({
  user: initialUser,
  currentProfile: JSON.parse(localStorage.getItem('myflix_current_profile') || 'null'),
  myList: [],
  playlists: savedPlaylists,
  viewHistory: JSON.parse(localStorage.getItem('myflix_history') || '[]'),
  viewProgress: JSON.parse(localStorage.getItem('myflix_progress') || '{}'),
  customContent: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [],
  isAuthenticated: true, // Toujours vrai
  activeTrack: null,
  isPlaying: false,

  login: (email: string) => {
    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('myflix_current_profile');
    set({ currentProfile: null, isPlaying: false, activeTrack: null });
  },

  selectProfile: (profile: Profile | null) => {
    if (profile) {
      localStorage.setItem('myflix_current_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('myflix_current_profile');
    }
    set({ currentProfile: profile });
  },

  updateProfile: (id: string, name: string, avatar: string) => {
    const updatedProfiles = get().user.profiles.map(p =>
      p.id === id ? { ...p, name, avatar } : p
    );
    const newUser = { ...get().user, profiles: updatedProfiles };
    set({ user: newUser });
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
    if (get().currentProfile?.id === id) {
      set({ currentProfile: { ...get().currentProfile!, name, avatar } });
    }
  },

  addProfile: (name: string, avatar: string) => {
    const newProfile: Profile = {
      id: `p_${Date.now()}`,
      name,
      avatar,
      isKid: false
    };
    const updatedProfiles = [...get().user.profiles, newProfile];
    const newUser = { ...get().user, profiles: updatedProfiles };
    set({ user: newUser });
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
  },

  addToMyList: (movieId: string) => {
    set((state) => ({ myList: [...state.myList, movieId] }));
  },

  removeFromMyList: (movieId: string) => {
    set((state) => ({ myList: state.myList.filter((id) => id !== movieId) }));
  },

  isInMyList: (movieId: string) => {
    return get().myList.includes(movieId);
  },

  addToHistory: (movieId: string) => {
    const history = [movieId, ...get().viewHistory.filter(id => id !== movieId)].slice(0, 20);
    set({ viewHistory: history });
    localStorage.setItem('myflix_history', JSON.stringify(history));
  },

  saveProgress: (movieId: string, time: number, duration: number) => {
    const profile = get().currentProfile;
    if (!profile) return;
    const key = `${profile.id}_${movieId}`;
    const newProgress = { ...get().viewProgress, [key]: { time, duration } };
    set({ viewProgress: newProgress });
    localStorage.setItem('myflix_progress', JSON.stringify(newProgress));
  },

  getProgress: (movieId: string) => {
    const profile = get().currentProfile;
    if (!profile) return null;
    const key = `${profile.id}_${movieId}`;
    return get().viewProgress[key] || null;
  },

  initCustomContent: async () => {
    const content: Movie[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || MOCK_MOVIES;
    const updatedContent = await Promise.all(content.map(async (media) => {
      if (media.isCustom) {
        const blob = await idbGet(`media_blob_${media.id}`);
        if (blob) {
          return { ...media, videoUrl: URL.createObjectURL(blob as Blob) };
        }
      }
      return media;
    }));
    set({ customContent: updatedContent });
  },

  addCustomMedia: async (media: Movie, file?: File | Blob) => {
    if (file) {
      await idbSet(`media_blob_${media.id}`, file);
    }
    const newContent = [media, ...get().customContent];
    set({ customContent: newContent });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
  },

  removeCustomMedia: async (mediaId: string) => {
    await idbDel(`media_blob_${mediaId}`);
    const newContent = get().customContent.filter(m => m.id !== mediaId);
    set({ customContent: newContent });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
  },

  setActiveTrack: (track: Movie | null) => set({ activeTrack: track, isPlaying: !!track }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

  // Playlist Management
  createPlaylist: (name: string) => {
    const newPlaylist = {
      id: `playlist_${Date.now()}`,
      name,
      trackIds: [],
      createdAt: Date.now()
    };
    const playlists = [...get().playlists, newPlaylist];
    set({ playlists });
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  deletePlaylist: (playlistId: string) => {
    const playlists = get().playlists.filter(p => p.id !== playlistId);
    set({ playlists });
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  addToPlaylist: (playlistId: string, trackId: string) => {
    const playlists = get().playlists.map(p =>
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    );
    set({ playlists });
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  removeFromPlaylist: (playlistId: string, trackId: string) => {
    const playlists = get().playlists.map(p =>
      p.id === playlistId
        ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) }
        : p
    );
    set({ playlists });
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  openaiKey: localStorage.getItem('myflix_openai_key') || import.meta.env.VITE_OPENAI_API_KEY || config.openaiApiKey || "sk-proj-DEMO",
  setOpenaiKey: (key: string) => {
    set({ openaiKey: key });
    localStorage.setItem('myflix_openai_key', key);
  },

  geminiKey: localStorage.getItem('myflix_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || config.geminiApiKey || "AIzaSy-DEMO_KEY_REMOVED",
  setGeminiKey: (key: string) => {
    set({ geminiKey: key });
    localStorage.setItem('myflix_gemini_key', key);
  },

  aiProvider: (localStorage.getItem('myflix_ai_provider') as 'gemini' | 'openai') || 'gemini',
  setAiProvider: (provider: 'gemini' | 'openai') => {
    set({ aiProvider: provider });
    localStorage.setItem('myflix_ai_provider', provider);
  },

  isSettingsOpen: false,
  setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open })
}));
