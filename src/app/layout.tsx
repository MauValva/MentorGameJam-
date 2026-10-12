import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Jam Mentor",
  description: "Mentorias de Direção de Arte em movimento.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
