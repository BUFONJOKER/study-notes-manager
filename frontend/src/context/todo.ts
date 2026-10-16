"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import type { NoteCreate, NoteUpdate, NoteResponse } from "@/types/notes";
import type { UserCreate, UserUpdate, UserResponse } from "@/types/users";

type AppContextValue = {
  // Auth state driven by NextAuth
  token: string | null;
  logout: () => void;
  // Notes data state management
  notes: NoteResponse[];
  getNote: (id: string) => NoteResponse | undefined;
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

    // Fetch OpenAI Validation Status on App Startup
    fetch(`${API_BASE_URL}/openai/validate-key`, { headers: authHeaders })
      .then((res) => {
        if (res.ok) setApiConfigured(true);
      })
      .catch(() => setApiConfigured(false));

  }, [token, status, session, authHeaders]);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  // --- Profile Operations ---
  const registerUser = useCallback(async (userData: UserCreate) => {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Registration failed");
    const data: UserResponse = await res.json();
    setProfile(data);
  }, []);

  const updateUser = useCallback(async (userData: UserUpdate) => {
    if (!profile?.user_id) return;
    const res = await fetch(`${API_BASE_URL}/users/${profile.user_id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Update profile failed");
    const data: UserResponse = await res.json();
    setProfile(data);
  }, [profile, authHeaders]);

  const deleteAccount = useCallback(async () => {
    if (!profile?.user_id) return;
    const res = await fetch(`${API_BASE_URL}/users/${profile.user_id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to delete account");
    logout();
  }, [profile, authHeaders, logout]);

  // --- Note Operations ---
  const getNote = useCallback((id: string) => notes.find((n) => n.note_id === id), [notes]);

  const selectNote = useCallback((id: string) => setSelectedId(id), []);

  const saveNote = useCallback(async (noteData: Omit<NoteCreate, "user_id">) => {
    if (!profile?.user_id) return;
    const payload: NoteCreate = { ...noteData, user_id: profile.user_id };
    const res = await fetch(`${API_BASE_URL}/notes/create_note`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Could not save note");
    const newNote: NoteResponse = await res.json();
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.note_id);
  }, [profile, authHeaders]);

  const updateNote = useCallback(async (noteId: string, noteData: NoteUpdate) => {
    const res = await fetch(`${API_BASE_URL}/notes/update_note/${noteId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(noteData),
    });
    if (!res.ok) throw new Error("Could not update note");
    const updatedNote: NoteResponse = await res.json();
    setNotes((prev) => prev.map((n) => (n.note_id === noteId ? updatedNote : n)));
  }, [authHeaders]);

  const selectedNote = useMemo(() => notes.find((n) => n.note_id === selectedId), [notes, selectedId]);

  // --- Delete Modal Operations ---
  const requestDelete = useCallback((note: NoteResponse) => setDeleteTarget(note), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const res = await fetch(`${API_BASE_URL}/notes/delete_note/${deleteTarget.note_id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Could not delete note");
    setNotes((prev) => prev.filter((n) => n.note_id !== deleteTarget.note_id));
    if (selectedId === deleteTarget.note_id) setSelectedId(null);
    setDeleteTarget(null);
  }, [deleteTarget, selectedId, authHeaders]);

  // --- AI / API Modal Functions ---
  const openApiModal = useCallback(() => setApiModalOpen(true), []);
  const closeApiModal = useCallback(() => setApiModalOpen(false), []);

  const requestAi = useCallback((noteId: string) => {
    if (!apiConfigured) {
      setApiModalOpen(true);
    } else {
      const eventSource = new EventSource(`${API_BASE_URL}/notes/quiz_generation/${noteId}`);
      eventSource.onmessage = (event) => {
        console.log("Stream update received: ", event.data);
      };
      eventSource.onerror = () => eventSource.close();
    }
  }, [apiConfigured]);

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
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
