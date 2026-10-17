"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import type { NoteCreate, NoteUpdate, NoteResponse } from "@/types/notes";
import type { UserCreate, UserUpdate, UserResponse } from "@/types/users";
import axios from "axios";

type AppContextValue = {
  // Auth state driven by NextAuth
  token: string | null;
  logout: () => void;
  // Notes data state management
  notes: NoteResponse[];
  getNote: (id: number) => NoteResponse | undefined;
  saveNote: (note: Omit<NoteCreate, "user_id">) => Promise<void>;
  updateNote: (id: string, note: NoteUpdate) => Promise<void>;
  selectedNote: NoteResponse | undefined;
  selectNote: (id: string) => void;
  // delete-note modal handling
  deleteTarget: NoteResponse | null;
  requestDelete: (note: NoteResponse) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
  // user settings
  profile: UserResponse | null;
  setProfile: (profile: UserResponse | null) => void;
  // AI Keys settings configuration
  apiConfigured: boolean;
  setApiConfigured: (value: boolean) => void;
  apiModalOpen: boolean;
  openApiModal: () => void;
  closeApiModal: () => void;
  requestAi: (noteId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AppProvider({ children }: { children: ReactNode }) {
  // 1. Automatically grab your custom session layout from NextAuth
  const { data: session, status } = useSession();

  // Cast token securely from NextAuth Session type extension
  const token = (session as any)?.accessToken || null;

  // --- Real State Hooks ---
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NoteResponse | null>(null);
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);
  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);

  // Helper config options for authenticated headers
  const authHeaders = useMemo(() => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  // --- Sync State Data on Auth Verification ---
  useEffect(() => {
    if (status !== "authenticated" || !token) {
      setNotes([]);
      setProfile(null);
      setApiConfigured(false);
      return;
    }

    // Set initial user info from NextAuth profile baseline data
    if (session?.user?.name) {
      setProfile({
        user_name: session.user.name,
        user_id: 0, // Fallback if user_id is fetched via dynamic profile endpoints later
      });
    }

    // // Fetch OpenAI Validation Status on App Startup
    // fetch(`${API_BASE_URL}/openai/validate-key`, { headers: authHeaders })
    //   .then((res) => {
    //     if (res.ok) setApiConfigured(true);
    //   })
    //   .catch(() => setApiConfigured(false));

  }, [token, status, session, authHeaders]);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  // Profile Operations
  const registerUser = useCallback(async (userData: UserCreate) => {
    const res = await axios.post(`${API_BASE_URL}/users/`, userData);
    setProfile(res.data);
  }, []);

  const updateUser = useCallback(async (userId: number, userData: UserUpdate) => {
    const res = await axios.put(`${API_BASE_URL}/users/${userId}/`, userData);
    setProfile(res.data);
  }, []);

  const deleteAccount = useCallback(async (userId: number) => {
    await axios.delete(`${API_BASE_URL}/users/${userId}/`);
    setProfile(null);
    setNotes([]);
    setApiConfigured(false);
  }, []);

  // Note Operations
  const getNote = useCallback((user_id: number) => {
    return notes.find((note) => note.user_id === user_id);
  }, [notes]);

  const selectNote = useCallback((noteId: string) => {
    setSelectedId(noteId);
  }, []);

  const saveNote = useCallback(async (note: Omit<NoteCreate, "user_id">) => {
    const res = await axios.post(`${API_BASE_URL}/notes/`, note, { headers: authHeaders });
    setNotes((prev) => [res.data, ...prev]);
    setSelectedId(res.data.id);
  }, [authHeaders]);

  const updateNote = useCallback(async (note_id: string, note: NoteUpdate) => {
    const res = await axios.put(`${API_BASE_URL}/notes/${note_id}/`, note, { headers: authHeaders });
    setNotes((prev) => prev.map((n) => n.note_id === note_id ? res.data : n));
  }, [authHeaders]);

  const selectedNote = useMemo(() => notes.find((note) => note.note_id === selectedId), [notes, selectedId]);

  const requestDelete = useCallback((note: NoteResponse) => {
    setDeleteTarget(note);
  }

, []);
  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await axios.delete(`${API_BASE_URL}/notes/${deleteTarget.note_id}/`, { headers: authHeaders });
    setNotes((prev) => prev.filter((n) => n.note_id !== deleteTarget.note_id));
    setDeleteTarget(null);
  }, [deleteTarget, authHeaders]);

  const openApiModal = useCallback(() => {
    setApiModalOpen(true);
  }, []);

  const closeApiModal = useCallback(() => {
    setApiModalOpen(false);
  }, []);

  const requestAi = useCallback((noteId: string) => {
    // Implement AI request logic here
    console.log(`Requesting AI for note ID: ${noteId}`);
  }, []);
  // const saveNote = useCallback((note: NoteCreate) => {
  //   setNotes((prev) => [note, ...prev.filter((n) => n.note_id !== note.note_id)]);
  //   setSelectedId(note.note_id);
  //   setIsNewUser(false);
  // }, []);

  // const confirmDelete = useCallback(() => {
  //   if (!deleteTarget) return;
  //   setNotes((prev) => prev.filter((n) => n.note_id !== deleteTarget.note_id));
  //   setDeleteTarget(null);
  //   router.push(routes.notes);
  // }, [deleteTarget, router]);

  // const registerUser = useCallback((newProfile: UserCreate) => {
  //   setProfile(newProfile);
  //   setIsNewUser(true);
  //   router.push(routes.dashboard);
  // }, [router]);

  // const deleteAccount = useCallback(() => {
  //   setNotes([]);
  //   setApiConfigured(false);
  //   setIsNewUser(true);
  //   router.push(routes.login);
  // }, [router]);

  // const requestAi = useCallback(() => {
  //   if (apiConfigured) router.push(routes.quizGenerating);
  //   else setApiModalOpen(true);
  // }, [apiConfigured, router]);

  // --- Compile Context value ---
  const value = useMemo(() => ({
    token, logout,
    notes, getNote, saveNote, updateNote, selectedNote, selectNote,
    deleteTarget, requestDelete, cancelDelete, confirmDelete,
    profile, setProfile, registerUser, updateUser, deleteAccount,
    apiConfigured, setApiConfigured, apiModalOpen, openApiModal, closeApiModal, requestAi
  }), [
    token, logout, notes, getNote, saveNote, updateNote, selectedNote, selectNote,
    deleteTarget, requestDelete, cancelDelete, confirmDelete,
    profile, registerUser, updateUser, deleteAccount,
    apiConfigured, apiModalOpen, openApiModal, closeApiModal, requestAi
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
