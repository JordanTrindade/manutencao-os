import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Manutenção OS | Smart Empresarial",
  description:
    "Ordens de serviço de manutenção para relógios e catracas — cadastro, peças, assinatura e exportação PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="app">
          <Nav />
          <div className="workspace">
            <main className="page">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
