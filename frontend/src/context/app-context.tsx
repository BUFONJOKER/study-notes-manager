"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { initialNotes } from "@/data/notes";
import { routes } from "@/lib/routes";
import type { NoteCreate, NoteUpdate, NoteResponse, QuizGenerationResponse } from "@/types/notes";
import type { UserCreate, UserUpdate, UserResponse,  } from "@/types/users";
import type { OpenAIKeyRequest, OpenAIKeyResponse } from "@/types/openai";

type AppContextValue = {
  // notes
  notes: NoteResponse[];
  getNote: (id: string) => NoteResponse | undefined;
  saveNote: (note: NoteCreate) => void;
  updateNote: (note: NoteUpdate) => void;
  selectedNote: NoteResponse | undefined;
  /** Remembers the last note the user opened (used by the quiz screens' back links). */
  selectNote: (id: string) => void;
  // delete-note modal
  deleteTarget: NoteResponse | null;
  requestDelete: (note: NoteResponse) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  // user
  profile: UserResponse;
  setProfile: (profile: UserCreate) => void;
  isNewUser: boolean;
  registerUser: (profile: UserCreate) => void;
  updateUser: (profile: UserUpdate) => void;
  deleteAccount: () => void;
  // AI / API key
  apiConfigured: boolean;
  setApiConfigured: (value: boolean) => void;
  apiModalOpen: boolean;
  openApiModal: () => void;
  closeApiModal: () => void;
  /** Starts quiz generation, or opens the API-key modal when no key is configured. */
  requestAi: (quiz: QuizGenerationResponse) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteCreate[]>(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0].note_id);
  const [profile, setProfile] = useState<UserResponse>({user_id:1, user_name: "alexm"});
  const [deleteTarget, setDeleteTarget] = useState<NoteResponse | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const getNote = useCallback((note_id: string) => notes.find((note) => note.note_id === note_id), [notes]);

  const saveNote = useCallback((note: NoteCreate) => {
    setNotes((prev) => [note, ...prev.filter((n) => n.note_id !== note.note_id)]);
    setSelectedId(note.note_id);
    setIsNewUser(false);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setNotes((prev) => prev.filter((n) => n.note_id !== deleteTarget.note_id));
    setDeleteTarget(null);
    router.push(routes.notes);
  }, [deleteTarget, router]);

  const registerUser = useCallback((newProfile: UserCreate) => {
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
