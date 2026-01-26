import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "../components/Footer/Footer";
import { AuthProvider } from "../components/Auth/AuthProvider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://travel-tactik.com"),
  title: {
    default: "TravelTactik — Même voyage. Meilleur plan.",
    template: "%s — TravelTactik",
  },
  description:
    "Conseil voyage sur-mesure : stratégie, optimisation budget/temps/confort, itinéraires et check-lists pour réserver efficacement.",
  alternates: {
    canonical: "https://travel-tactik.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="appShell">
            <div className="appMain">{children}</div>
            <Analytics />
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
