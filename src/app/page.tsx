import Link from "next/link";
import { OrderList } from "@/components/OrderList";
import { listOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const orders = listOrders(q);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,#0f5c6e_0%,#163a4a_55%,#1b2730_100%)] text-white shadow-[var(--shadow)]">
        <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#9fd4de]">
              Laboratório de manutenção
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight sm:text-5xl">
              Manutenção OS
            </h1>
            <p className="mt-3 max-w-xl text-base text-[#d7e8ed]">
              Cadastre ordens de serviço de relógios e catracas, controle peças,
              colete assinatura e exporte o PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/os/nova" className="btn bg-white text-[var(--brand-dark)]">
              Nova OS
            </Link>
            <Link href="/pecas" className="btn border border-white/30 bg-white/10 text-white">
              Catálogo de peças
            </Link>
          </div>
        </div>
      </section>

      <OrderList initialOrders={orders} initialQuery={q || ""} />
    </div>
  );
}
