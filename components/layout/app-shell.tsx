import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white">
          <Sidebar />
        </aside>

        <div className="flex-1">
          <header className="h-16 border-b bg-white">
            <Topbar />
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

