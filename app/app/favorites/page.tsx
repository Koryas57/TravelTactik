import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { getSql } from "../../../lib/db";
import styles from "./Favorites.module.scss";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return null;

  const sql = getSql();

  const userRows = await sql`
    select id from users where lower(email) = ${email} limit 1;
  `;
  const userId = userRows?.[0]?.id;
  if (!userId) return null;

  const rows = await sql`
    select o.id, o.slug, o.title, o.destination, o.image_url, o.price_from_eur, o.duration_days, o.tags, o.meta
    from favorites f
    join offers o on o.id = f.offer_id
    where f.user_id = ${userId}::uuid
    order by f.created_at desc
    limit 200;
  `;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>Mes favoris</h1>
      {!rows?.length ? (
        <p className={styles.muted}>
          Tu n’as encore aucun favori. Va sur la page Offres pour en
          enregistrer.
        </p>
      ) : (
        <div className={styles.grid}>
          {rows.map((o: any) => (
            <article key={o.id} className={styles.card}>
              <div className={styles.media}>
                <div
                  className={styles.bg}
                  style={
                    o.image_url
                      ? { backgroundImage: `url(${o.image_url})` }
                      : undefined
                  }
                />
              </div>
              <div className={styles.body}>
                <strong className={styles.title}>{o.title}</strong>
                <div className={styles.meta}>
                  {o.destination} ·{" "}
                  {o.duration_days
                    ? `${o.duration_days} jours`
                    : "Durée flexible"}{" "}
                  ·{" "}
                  {typeof o.price_from_eur === "number"
                    ? `dès ${o.price_from_eur}€`
                    : "Budget variable"}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
