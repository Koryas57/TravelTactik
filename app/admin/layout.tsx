import type { ReactNode } from "react";
import { AdminHeader } from "../../components/Admin/AdminHeader/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main className="container" style={{ padding: "28px 0" }}>
        {children}
      </main>
    </>
  );
}
