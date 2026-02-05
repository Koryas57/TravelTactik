import Link from "next/link";
import { AdminLeadsClient } from "../../../components/Admin/AdminLeadsClient";

export const metadata = {
  title: "Admin — Leads & Documents",
};

export default function AdminLeadsPage() {
  return (
    <>
      <div className="container" style={{ paddingTop: 18 }}>
        <Link href="/admin" style={{ fontWeight: 700 }}>
          ← Retour à Synthèse & Devis
        </Link>
      </div>
      <AdminLeadsClient />
    </>
  );
}
