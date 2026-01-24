import { Header } from "../../components/Header/Header";
import { OffersClient } from "../../components/Offers/OffersClient";

export const dynamic = "force-dynamic";

export default function OffresPage() {
  return (
    <>
      <Header showCta={false} />
      <main className="container" style={{ padding: "28px 0" }}>
        <OffersClient />
      </main>
    </>
  );
}
