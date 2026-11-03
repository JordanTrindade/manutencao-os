import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderForm } from "@/components/OrderForm";
import { getOrder, listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(Number(id));
  if (!order) notFound();
  const parts = listParts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/" className="text-sm font-semibold text-[var(--brand)]">
            ← Voltar às ordens
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            OS #{order.id}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {order.client_name} · Série {order.serial_number}
          </p>
        </div>
      </div>
      <OrderForm initialOrder={order} initialParts={parts} />
    </div>
  );
}
