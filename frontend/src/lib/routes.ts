export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  notes: "/notes",
  newNote: "/notes/new",
  note: (id: string) => `/notes/${encodeURIComponent(id)}`,
  editNote: (id: string) => `/notes/${encodeURIComponent(id)}/edit`,
  quiz: "/quiz",
  quizGenerating: "/quiz/generating",
  account: "/account",
  deleteAccount: "/account/delete",
} as const;
