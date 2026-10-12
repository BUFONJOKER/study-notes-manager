import { Sidebar } from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f3]">
      <Sidebar />
      <div className="ml-65 min-w-0">
        <TopBar />
        <main className="mx-auto max-w-335 p-8">{children}</main>
      </div>
    </div>
  );
}