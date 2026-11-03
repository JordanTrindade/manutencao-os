import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
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
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Nav />
        <main className="shell py-8 pb-16">{children}</main>
      </body>
    </html>
  );
}
