import { routes } from "./routes";

/** Which main-navigation item is active for a given pathname. */
export function getNavState(pathname: string) {
  const inNotes =
    pathname === routes.notes ||
    (pathname.startsWith(`${routes.notes}/`) && pathname !== routes.newNote);

  return {
    dashboard: pathname === routes.dashboard,
    notes: inNotes,
    quiz: pathname.startsWith(routes.quiz),
    account: pathname.startsWith(routes.account),
  };
}

export function getPageTitle(pathname: string) {
  if (pathname === routes.dashboard) return "Dashboard";
  if (pathname === routes.notes) return "All notes";
  if (pathname === routes.newNote) return "Create note";
  if (/^\/notes\/[^/]+\/edit$/.test(pathname)) return "Edit note";
  if (pathname.startsWith(`${routes.notes}/`)) return "Note details";
  if (pathname === routes.quizGenerating) return "Quiz generation";
  if (pathname.startsWith(routes.quiz)) return "Quiz results";
  if (pathname === routes.deleteAccount) return "Delete account";
  if (pathname.startsWith(routes.account)) return "Account settings";
  return "Noteflow";
}
