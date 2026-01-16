import { Header } from "../components/Header/Header";
import { SearchBox } from "../components/SearchBox/SearchBox";

export default function Home() {
  return (
    <>
      <Header />

      <main className="container" style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "18px 0 10px" }}>Même voyage. Meilleur plan.</h1>
        <p style={{ margin: 0, color: "var(--tt-muted)" }}>
          Tu réserves. Je t’aide à optimiser budget, confort et itinéraire.
        </p>

        <section id="brief" style={{ marginTop: 28 }}>
          <div
            style={{
              background: "var(--tt-card)",
              border: "1px solid var(--tt-border)",
              borderRadius: "var(--tt-radius-md)",
              padding: 16,
              boxShadow: "var(--tt-shadow)",
            }}
          >
            <section id="brief" style={{ marginTop: 28 }}>
              <SearchBox />
            </section>

          </div>
        </section>
      </main>
    </>
  );
}
