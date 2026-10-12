"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { initialNotes } from "@/data/notes";
import { routes } from "@/lib/routes";
import type { Note, UserProfile } from "@/types";

type AppContextValue = {
  // notes
  notes: Note[];
  getNote: (id: string) => Note | undefined;
  saveNote: (note: Note) => void;
  selectedNote: Note | undefined;
  /** Remembers the last note the user opened (used by the quiz screens' back links). */
  selectNote: (id: string) => void;
  // delete-note modal
  deleteTarget: Note | null;
  requestDelete: (note: Note) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  // user
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  isNewUser: boolean;
  registerUser: (profile: UserProfile) => void;
  deleteAccount: () => void;
  // AI / API key
  apiConfigured: boolean;
  setApiConfigured: (value: boolean) => void;
  apiModalOpen: boolean;
  openApiModal: () => void;
  closeApiModal: () => void;
  /** Starts quiz generation, or opens the API-key modal when no key is configured. */
  requestAi: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0].id);
  const [profile, setProfile] = useState<UserProfile>({ name: "Alex Morgan", username: "alexm", email: "alex@example.com" });
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const getNote = useCallback((id: string) => notes.find((note) => note.id === id), [notes]);

  const saveNote = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
    setSelectedId(note.id);
    setIsNewUser(false);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setDeleteTarget(null);
    router.push(routes.notes);
  }, [deleteTarget, router]);

  const registerUser = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsNewUser(true);
    router.push(routes.dashboard);
  }, [router]);

  const deleteAccount = useCallback(() => {
    setNotes([]);
    setApiConfigured(false);
    setIsNewUser(true);
    router.push(routes.login);
  }, [router]);

  const requestAi = useCallback(() => {
    if (apiConfigured) router.push(routes.quizGenerating);
    else setApiModalOpen(true);
  }, [apiConfigured, router]);

  const value = useMemo<AppContextValue>(() => ({
    notes,
    getNote,
    saveNote,
    selectedNote: notes.find((note) => note.id === selectedId),
    selectNote: setSelectedId,
    deleteTarget,
    requestDelete: setDeleteTarget,
    cancelDelete: () => setDeleteTarget(null),
    confirmDelete,
    profile,
    setProfile,
    isNewUser,
    registerUser,
    deleteAccount,
    apiConfigured,
    setApiConfigured,
    apiModalOpen,
    openApiModal: () => setApiModalOpen(true),
    closeApiModal: () => setApiModalOpen(false),
    requestAi,
  }), [notes, getNote, saveNote, selectedId, deleteTarget, confirmDelete, profile, isNewUser, registerUser, deleteAccount, apiConfigured, apiModalOpen, requestAi]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
