import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { getSql } from "../../../lib/db";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!email) return null;

  const sql = getSql();
  const rows = await sql`
    select id, brief, pack, speed, price_eur, payment_status, created_at, paid_at
    from leads
    where lower(email) = ${email}
    order by created_at desc
    limit 50;
  `;

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1>Mes plans de voyage</h1>

      {!rows?.length ? (
        <p style={{ color: "var(--tt-muted)" }}>
          Aucun plan pour l’instant. Tu peux en créer un depuis l’accueil.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          {rows.map((r: any) => (
            <div
              key={r.id}
              style={{
                border: "1px solid var(--tt-border)",
                borderRadius: 16,
                padding: 16,
                background: "rgba(255,255,255,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <strong>
                  {r.brief?.destination || "Destination flexible"}
                </strong>
                <span style={{ color: "var(--tt-muted)" }}>
                  {r.payment_status || "—"}
                </span>
              </div>

              <div style={{ color: "var(--tt-muted)", marginTop: 6 }}>
                {r.brief?.durationDays} jours · {r.brief?.travelers} voyageurs ·
                ≤ {r.brief?.budgetMax}€ / pers
              </div>

              <div style={{ marginTop: 10 }}>
                Pack: <strong>{r.pack}</strong> · Délai:{" "}
                <strong>{r.speed}</strong> · Prix:{" "}
                <strong>{r.price_eur}€</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
