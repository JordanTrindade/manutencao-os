import { OrderForm } from "@/components/OrderForm";
import { listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function NovaOsPage() {
  const parts = listParts();

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          Nova ordem
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Abrir ordem de serviço
        </h1>
      </div>
      <OrderForm initialParts={parts} />
    </div>
  );
}
