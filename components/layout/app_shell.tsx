import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r bg-white">
          <Sidebar />
        </aside>

        <div className="flex-1">
          <header className="h-16 border-b bg-white">
            <Topbar />
          </header>

          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
