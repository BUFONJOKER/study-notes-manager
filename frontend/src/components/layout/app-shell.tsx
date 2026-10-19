"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { getPageTitle } from "@/lib/nav";
import { ApiKeyModal } from "@/components/api-key/api-key-modal";
import { DeleteNoteModal } from "@/components/notes/delete-note-modal";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { deleteTarget, cancelDelete, confirmDelete, apiModalOpen, closeApiModal, apiConfigured, setApiConfigured, setOpenaiKey } = useApp();

  // The mobile drawer is tied to the path it was opened on, so navigating closes it without an effect.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const menuOpen = drawerPath === pathname;

  return (
    <div className={cn("app-shell")}>
      <div className={cn(menuOpen ? "sidebar-wrap open" : "sidebar-wrap")}>
        <div className={cn("drawer-backdrop")} onClick={() => setDrawerPath(null)} />
        <Sidebar />
      </div>
      <div className={cn("main-shell")}>
        <Header title={getPageTitle(pathname)} onMenu={() => setDrawerPath(pathname)} />
        <main>{children}</main>
      </div>
      <MobileNav />
      {deleteTarget && <DeleteNoteModal note={deleteTarget} close={cancelDelete} confirm={confirmDelete} />}
      {apiModalOpen && (
        <ApiKeyModal
          configured={apiConfigured}
          close={closeApiModal}
          onAccepted={(submittedKey) => {
            setOpenaiKey(submittedKey);
            setApiConfigured(true);
          }}
          onClear={() => {
            setOpenaiKey("");
            setApiConfigured(false);
          }}
        />
      )}
    </div>
  );
}
