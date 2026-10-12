# Noteflow

Study-notes app (Next.js App Router + Tailwind CSS v4), split out of a single `page.tsx`.

```bash
npm install
npm run dev     # http://localhost:3000
```

## Structure

```
src/
├─ app/                      # routes only – each page just renders a component
│  ├─ layout.tsx             # fonts, <AppProvider>
│  ├─ page.tsx               # / → redirects to /login
│  ├─ (auth)/                # layout = AuthShell
│  │  ├─ login/
│  │  └─ register/
│  └─ (app)/                 # layout = AppShell (sidebar, header, mobile nav, modals)
│     ├─ dashboard/
│     ├─ notes/              # list · new · [id] · [id]/edit
│     ├─ quiz/               # results · generating
│     └─ account/            # settings · delete
├─ components/
│  ├─ ui/                    # Button, Badge, Brand, Icon, Modal, PageHeading, PasswordInput, BackLink
│  ├─ layout/                # AppShell, AuthShell, Sidebar, Header, MobileNav
│  ├─ dashboard/             # DashboardView, StatsGrid, RecentNotesPanel, ActivityPanel, SubjectsPanel, EmptyDashboard
│  ├─ notes/                 # NotesList, NoteRow, NoteForm, NoteDetail, EditNote, DeleteNoteModal, NoteNotFound
│  ├─ quiz/                  # QuizProgress, QuizResults
│  ├─ auth/                  # LoginForm, RegisterForm
│  ├─ account/               # AccountView, ProfileForm, PasswordForm, ProfilePhotoSection, DeleteAccountView
│  └─ api-key/               # ApiKeyModal
├─ context/app-context.tsx   # notes, profile, API-key state, delete-note modal (replaces the old App state)
├─ data/                     # seed notes, subjects, quiz copy, chart values
├─ lib/                      # ui.ts (class alias map), cn.ts, routes.ts, nav.ts, utils.ts
└─ types/index.ts
```

## Notes

- The old `screen` state is replaced by real routes (see `lib/routes.ts`).
- Styling is unchanged: the `ui` alias map and `cn()` live in `lib/`. `font-['Newsreader']` became `font-heading`, wired to `next/font` in `globals.css`.
- Auth, notes and the API key are still in-memory mock state, as in the original file. Replace `AppProvider` with real data fetching/auth when ready.
