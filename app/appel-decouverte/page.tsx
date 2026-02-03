"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Header } from "../../components/Header/Header";
import { CalendlyEmbed } from "../../components/CalendlyEmbed/CalendlyEmbed";
import styles from "./page.module.scss";

type ComfortLevel = "eco" | "comfort" | "premium";

export default function AppelDecouvertePage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "";
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [travelers, setTravelers] = useState("2");
  const [budgetMax, setBudgetMax] = useState("1200");
  const [comfort, setComfort] = useState<ComfortLevel>("comfort");
  const [avoidLayovers, setAvoidLayovers] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const formTimestamp = useMemo(() => Date.now(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      const composedNotes = [
        phone.trim() ? `Téléphone: ${phone.trim()}` : null,
        notes.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const payload = {
        email,
        notes: composedNotes,
        pack: "audit",
        speed: "standard",
        priceEUR: 0,
        brief: {
          destination: destination.trim(),
          durationDays: Math.max(1, Number(durationDays) || 1),
          travelers: Math.max(1, Number(travelers) || 1),
          comfort,
          budgetMax: Math.max(0, Number(budgetMax) || 0),
          avoidLayovers,
        },
        selectedPlan: comfort,
        createdAt: new Date().toISOString(),
        hp: "",
        ts: formTimestamp,
        page: "/appel-decouverte",
      };

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Erreur lors de l’envoi.");
      }

      setStatus("success");
      setStatusMessage("Merci ! On revient vers toi très vite.");
      setEmail("");
      setPhone("");
      setDestination("");
      setDurationDays("7");
      setTravelers("2");
      setBudgetMax("1200");
      setComfort("comfort");
      setAvoidLayovers(false);
      setNotes("");
    } catch (e) {
      setStatus("error");
      setStatusMessage(
        e instanceof Error ? e.message : "Erreur lors de l’envoi.",
      );
    }
  }

  return (
    <>
      <Header showCta={false} />
      <main className={`container ${styles.page}`}>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Appel découverte</span>
            <h1 className={styles.h1}>Réserve ton appel gratuit</h1>
            <p className={styles.lead}>
              30 minutes pour cadrer destination, dates, budget et priorités
              afin de préparer un voyage impeccable.
            </p>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.heroCardTitle}>Ce que l’on prépare</div>
            <ul className={styles.heroList}>
              <li>Une proposition adaptée à ton rythme</li>
              <li>Un budget clair dès le départ</li>
              <li>Des activités alignées avec tes envies</li>
            </ul>
          </div>
        </header>

        <section className={styles.grid}>
          <div className={styles.left}>
            <CalendlyEmbed url={calendlyUrl} height={720} />
          </div>

          <aside className={styles.right}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Prépare l’appel</div>

              <ul className={styles.bullets}>
                <li>Destination(s) envisagée(s) + alternatives possibles</li>
                <li>Dates / flexibilité</li>
                <li>Budget (repère) et niveau souhaité</li>
                <li>Contraintes (rythme, escales, activités indispensables)</li>
              </ul>

              <div className={styles.note}>
                Après réservation, tu reçois automatiquement la confirmation et
                l’invitation calendrier.
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Ou laisse un message</div>
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                  Email*
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="toi@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className={styles.label}>
                  Téléphone (optionnel)
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="+33…"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  Destination*
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Bali, Lisbonne…"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </label>

                <div className={styles.inlineFields}>
                  <label className={styles.label}>
                    Durée (jours)
                    <input
                      className={styles.input2}
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                    />
                  </label>

                  <label className={styles.label}>
                    Voyageurs
                    <input
                      className={styles.input2}
                      type="number"
                      min={1}
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.inlineFields}>
                  <label className={styles.label}>
                    Budget / pers.
                    <input
                      className={styles.input2}
                      type="number"
                      min={0}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                    />
                  </label>

                  <label className={styles.label}>
                    Niveau
                    <select
                      className={styles.select}
                      value={comfort}
                      onChange={(e) =>
                        setComfort(e.target.value as ComfortLevel)
                      }
                    >
                      <option value="eco">Éco</option>
                      <option value="comfort">Confort</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>
                </div>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={avoidLayovers}
                    onChange={(e) => setAvoidLayovers(e.target.checked)}
                  />
                  Éviter les escales longues si possible
                </label>

                <label className={styles.label}>
                  Ta demande*
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </label>

                <button
                  className={styles.btn}
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Envoi..." : "Envoyer ma demande"}
                </button>

                {statusMessage ? (
                  <div
                    className={
                      status === "success"
                        ? styles.success
                        : status === "error"
                          ? styles.error
                          : styles.formHint
                    }
                  >
                    {statusMessage}
                  </div>
                ) : (
                  <div className={styles.formHint}>
                    Tu peux aussi réserver directement un créneau avec Calendly.
                  </div>
                )}
              </form>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
