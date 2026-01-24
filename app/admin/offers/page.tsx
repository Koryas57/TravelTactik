import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { redirect } from "next/navigation";
import { AdminOffersClient } from "../../../components/AdminOffers/AdminOffersClient";

export default async function AdminOffersPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !allowed.includes(email))
    redirect("/login?callbackUrl=/admin/offers");

  return <AdminOffersClient />;
}
