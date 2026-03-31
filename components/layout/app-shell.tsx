import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-white">
          <Sidebar />
        </aside>

        <div className="min-h-screen pl-64">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

