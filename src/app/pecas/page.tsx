import { PartsAdmin } from "@/components/PartsAdmin";
import { listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function PecasPage() {
  const parts = listParts();

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          Administração
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Catálogo de peças
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Cadastre, edite e remova peças com preço. Elas aparecem no seletor da
          solução em cada ordem de serviço.
        </p>
      </div>
      <PartsAdmin initialParts={parts} />
    </div>
  );
}
