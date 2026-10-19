
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { api } from "@/lib/api";
import type {
  NoteCreate,
  NoteUpdate,
  NoteResponse,
  QuizStatus,
  QuizProgressState,
  QuizGenerationResponse
} from "@/types/notes";
import type {
  UserCreate,
  UserUpdate,
  UserResponse,
} from "@/types/users";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";



type AppContextValue = {
  token: string | null;
  logout: () => void;

  notes: NoteResponse[];
  getNote: (noteId: string) => NoteResponse | undefined;
  saveNote: (note: NoteCreate) => Promise<void>;
  updateNote: (noteId: string, note: NoteUpdate) => Promise<void>;
  selectedNote: NoteResponse | undefined;
  selectNote: (noteId: string) => void;

  deleteTarget: NoteResponse | null;
  requestDelete: (note: NoteResponse) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;

  isNewUser: boolean;
  profile: UserResponse | null;
  setProfile: Dispatch<SetStateAction<UserResponse | null>>;
  registerUser: (userData: UserCreate) => Promise<void>;
  updateUser: (
    userId: number,
    userData: UserUpdate,
  ) => Promise<void>;
  deleteAccount: (userId: number) => Promise<void>;

  generateQuiz: (noteId: string) => Promise<void>;
  cancelQuizGeneration: () => void;
  quizStatus: QuizStatus;
  quizProgress: QuizProgressState;
  quizError: string | null;
  quizResult: Record<string, unknown> | null;
  resetQuizState: () => void;

  apiConfigured: boolean;
  setApiConfigured: (value: boolean) => void;
  openaiKey: string;
  setOpenaiKey: (key: string) => void;
  apiModalOpen: boolean;
  openApiModal: () => void;
  closeApiModal: () => void;
  requestAi: (noteId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const EMPTY_PROGRESS: QuizProgressState = {
  node: null,
  data: null,
  history: [],
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string; message?: string }
      | undefined;

    return (
      data?.detail ||
      data?.message ||
      error.message ||
      "The request failed."
    );
  }

  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

function formatSseError(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return "Quiz generation failed. Please try again.";
}

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const token = session?.accessToken ?? null;

  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<NoteResponse | null>(null);

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const [openaiKey, setOpenaiKey] = useState<string>("");

  const [apiConfigured, setApiConfigured] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle");
  const [quizProgress, setQuizProgress] =
    useState<QuizProgressState>(EMPTY_PROGRESS);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] =
    useState<Record<string, unknown> | null>(null);

  const streamControllerRef = useRef<AbortController | null>(null);
  const activeQuizIdRef = useRef<string | null>(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  // --------------------------------------------------
  // Load the authenticated user's profile and notes
  // --------------------------------------------------

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus !== "authenticated" || !token) {
      setNotes([]);
      setProfile(null);
      setSelectedId(null);
      setDeleteTarget(null);
      setIsNewUser(false);
      setApiConfigured(false);
      return;
    }

    let cancelled = false;

    async function loadUserData() {
      try {
        const userResponse = await api.get<UserResponse>(
          `${API_BASE_URL}/users/me`,
          { headers: authHeaders },
        );

        if (cancelled) return;

        const user = userResponse.data;
        setProfile(user);

        const notesResponse = await api.get<NoteResponse[]>(
          `${API_BASE_URL}/notes/${user.user_id}`,
          { headers: authHeaders },
        );

        if (cancelled) return;

        const userNotes = notesResponse.data;
        setNotes(userNotes);
        setIsNewUser(userNotes.length === 0);

        setSelectedId((currentId) => {
          if (
            currentId &&
            userNotes.some((note) => note.note_id === currentId)
          ) {
            return currentId;
          }

          return null;
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load user data:", error);
        }
      }
    }

    void loadUserData();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, token, authHeaders]);

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const logout = useCallback(() => {
    void signOut({ callbackUrl: "/login" });
  }, []);

  // --------------------------------------------------
  // Notes
  // --------------------------------------------------

  const getNote = useCallback(
    (noteId: string) =>
      notes.find((note) => note.note_id === noteId),
    [notes],
  );

  const selectNote = useCallback((noteId: string) => {
    setSelectedId(noteId);
  }, []);

  const selectedNote = useMemo(
    () => notes.find((note) => note.note_id === selectedId),
    [notes, selectedId],
  );

  const saveNote = useCallback(
    async (note: NoteCreate) => {
      const response = await api.post<NoteResponse>(
        `${API_BASE_URL}/notes/create_note`,
        note,
        { headers: authHeaders },
      );

      const savedNote = response.data;

      setNotes((current) => [
        savedNote,
        ...current.filter(
          (item) => item.note_id !== savedNote.note_id,
        ),
      ]);

      setSelectedId(savedNote.note_id);
      setIsNewUser(false);
    },
    [authHeaders],
  );

  const updateNote = useCallback(
    async (noteId: string, note: NoteUpdate) => {
      const response = await api.patch<NoteResponse>(
        `${API_BASE_URL}/notes/update_note/${encodeURIComponent(noteId)}`,
        note,
        { headers: authHeaders },
      );

      const updatedNote = response.data;

      setNotes((current) =>
        current.map((item) =>
          item.note_id === noteId ? updatedNote : item,
        ),
      );
    },
    [authHeaders],
  );

  const requestDelete = useCallback((note: NoteResponse) => {
    setDeleteTarget(note);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const noteId = deleteTarget.note_id;

    await api.delete(
      `${API_BASE_URL}/notes/delete_note/${encodeURIComponent(noteId)}`,
      { headers: authHeaders },
    );

    setNotes((current) =>
      current.filter((note) => note.note_id !== noteId),
    );

    setSelectedId((current) =>
      current === noteId ? null : current,
    );

    setIsNewUser(notes.length <= 1);
    setDeleteTarget(null);
  }, [deleteTarget, authHeaders, notes.length]);

  // --------------------------------------------------
  // User profile
  // --------------------------------------------------

  const registerUser = useCallback(
    async (userData: UserCreate) => {
      const response = await api.post<UserResponse>(
        `${API_BASE_URL}/users/`,
        userData,
      );

      setProfile(response.data);
    },
    [],
  );

  const updateUser = useCallback(
    async (userId: number, userData: UserUpdate) => {
      const response = await api.put<UserResponse>(
        `${API_BASE_URL}/users/${userId}`,
        userData,
        { headers: authHeaders },
      );

      setProfile(response.data);
    },
    [authHeaders],
  );

  const deleteAccount = useCallback(
    async (userId: number) => {
      await api.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: authHeaders,
      });

      setNotes([]);
      setProfile(null);
      setSelectedId(null);

      await signOut({ callbackUrl: "/login" });
    },
    [authHeaders],
  );

  // --------------------------------------------------
  // SSE quiz generation
  // --------------------------------------------------

  const cancelQuizGeneration = useCallback(() => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    activeQuizIdRef.current = null;

    setQuizStatus((current) =>
      current === "generating" ? "cancelled" : current,
    );
  }, []);

  const resetQuizState = useCallback(() => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    activeQuizIdRef.current = null;

    setQuizStatus("idle");
    setQuizProgress(EMPTY_PROGRESS);
    setQuizError(null);
    setQuizResult(null);
  }, []);

  const generateQuiz = useCallback(
    async (noteId: string) => {
      if (!noteId.trim()) {
        setQuizError("A note ID is required.");
        setQuizStatus("error");
        return;
      }

      // Avoid accidentally starting the same stream twice.
      if (
        activeQuizIdRef.current === noteId &&
        streamControllerRef.current &&
        !streamControllerRef.current.signal.aborted
      ) {
        return;
      }

      streamControllerRef.current?.abort();

      const controller = new AbortController();

      streamControllerRef.current = controller;
      activeQuizIdRef.current = noteId;

      setQuizStatus("generating");
      setQuizProgress(EMPTY_PROGRESS);
      setQuizError(null);
      setQuizResult(null);

      let receivedCompleteEvent = false;

      try {
        // Browser -> Next.js proxy -> FastAPI POST endpoint.
        const response = await fetch(
          `/api/quiz/stream/${encodeURIComponent(noteId)}`,
          {
            method: "POST",
            headers: {
              Accept: "text/event-stream",
              ...(openaiKey ? { "X-OpenAI-Key": openaiKey } : {}),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const body = await response.text();

          let message = body || `Request failed (${response.status}).`;

          try {
            const parsed = JSON.parse(body) as {
              detail?: string;
              message?: string;
            };

            message = parsed.detail || parsed.message || message;
          } catch {
            // The upstream response wasn't JSON.
          }

          throw new Error(message);
        }

        if (!response.body) {
          throw new Error("The server did not return a readable stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        const handleEvent = (block: string) => {
          let eventName = "message";
          const dataLines: string[] = [];

          for (const line of block.split(/\r?\n/)) {
            if (!line || line.startsWith(":")) continue;

            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trimStart());
            }
          }

          if (dataLines.length === 0) return;

          const rawData = dataLines.join("\n");

          let data: unknown = rawData;

          try {
            data = JSON.parse(rawData);
          } catch {
            // Preserve non-JSON event data as text.
          }

          if (eventName === "workflow_update") {
            const update = data as {
              node?: string;
              data?: unknown;
            };

            if (!update.node) return;

            setQuizProgress((current) => ({
              node: update.node!,
              data: update.data ?? null,
              history: current.history.includes(update.node!)
                ? current.history
                : [...current.history, update.node!],
            }));

            return;
          }


          if (eventName === "complete") {
            const result = data as QuizGenerationResponse;

            receivedCompleteEvent = true;

            setQuizResult(result);
            setQuizStatus("completed");
            setQuizError(null);

            setNotes((current) =>
              current.map((note) =>
                note.note_id === result.note_id
                  ? {
                    ...note,
                    quiz: result.generated_questions,
                    analysis_result: result.analysis_result,
                    summary_result: result.summary_result,
                    key_concepts: result.key_concepts,
                  }
                  : note,
              ),
            );

            return;
          }


          if (eventName === "error") {
            throw new Error(formatSseError(data));
          }
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by a blank line.
          let separatorIndex = buffer.search(/\r?\n\r?\n/);

          while (separatorIndex !== -1) {
            const block = buffer.slice(0, separatorIndex);

            const separator = buffer.match(/\r?\n\r?\n/);
            const separatorLength = separator?.[0].length ?? 2;

            buffer = buffer.slice(separatorIndex + separatorLength);

            handleEvent(block);

            separatorIndex = buffer.search(/\r?\n\r?\n/);
          }
        }

        // Process a final event even if the stream ended without a blank line.
        if (buffer.trim()) {
          handleEvent(buffer);
        }

        if (!receivedCompleteEvent && !controller.signal.aborted) {
          throw new Error(
            "The stream ended before quiz generation completed.",
          );
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        const message = getErrorMessage(error);

        setQuizError(message);
        setQuizStatus("error");
      } finally {
        if (streamControllerRef.current === controller) {
          streamControllerRef.current = null;
          activeQuizIdRef.current = null;
        }
      }
    },
    [openaiKey],
  );

  // Abort an active stream when the authenticated session disappears.
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      streamControllerRef.current?.abort();
      streamControllerRef.current = null;
      activeQuizIdRef.current = null;
    }
  }, [sessionStatus]);

  // --------------------------------------------------
  // OpenAI-key modal and AI action
  // --------------------------------------------------

  const openApiModal = useCallback(() => {
    setApiModalOpen(true);
  }, []);

  const closeApiModal = useCallback(() => {
    setApiModalOpen(false);
  }, []);

  const requestAi = useCallback(
    (noteId: string) => {

      if (!noteId.trim()) {
        alert("Please select or open a specific note to generate a quiz.");
        return;
      }

      if (!apiConfigured) {
        setApiModalOpen(true);
        return;
      }

      router.push(`/quiz/generating/${encodeURIComponent(noteId)}`);

      void generateQuiz(noteId);
    },
    [apiConfigured, generateQuiz],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      token,
      logout,

      notes,
      getNote,
      saveNote,
      updateNote,
      selectedNote,
      selectNote,

      deleteTarget,
      requestDelete,
      cancelDelete,
      confirmDelete,

      isNewUser,
      profile,
      setProfile,
      registerUser,
      updateUser,
      deleteAccount,

      generateQuiz,
      cancelQuizGeneration,
      quizStatus,
      quizProgress,
      quizError,
      quizResult,
      resetQuizState,
      openaiKey,
      setOpenaiKey,

      apiConfigured,
      setApiConfigured,
      apiModalOpen,
      openApiModal,
      closeApiModal,
      requestAi,
    }),
    [
      token,
      logout,
      notes,
      getNote,
      saveNote,
      updateNote,
      selectedNote,
      selectNote,
      deleteTarget,
      requestDelete,
      cancelDelete,
      confirmDelete,
      isNewUser,
      profile,
      registerUser,
      updateUser,
      deleteAccount,
      generateQuiz,
      cancelQuizGeneration,
      quizStatus,
      quizProgress,
      quizError,
      quizResult,
      resetQuizState,
      openaiKey,
      setOpenaiKey,
      apiConfigured,
      apiModalOpen,
      openApiModal,
      closeApiModal,
      requestAi,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside <AppProvider>");
  }

  return context;
}
