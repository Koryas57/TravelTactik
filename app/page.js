import { Header } from "../components/Header/Header";
import { HomeClient } from "../components/Home/HomeClient";

export default function Home() {
  return (
    <>
      <Header />

      <main className="container" style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "18px 0 10px" }}>Même voyage. Meilleur plan.</h1>
        <p style={{ margin: 0, color: "var(--tt-muted)" }}>
          Tu réserves. Je t’aide à optimiser budget, confort et itinéraire.
        </p>

        <HomeClient />
      </main>
    </>
  );
}
