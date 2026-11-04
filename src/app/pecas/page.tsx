import { PartsAdmin } from "@/components/PartsAdmin";
import { listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function PecasPage() {
  const parts = listParts();

  return (
    <div>
      <header className="page-head">
        <div>
          <h1>Peças</h1>
          <p>Preços usados quando a peça entra numa ordem. A OS guarda o valor da época.</p>
        </div>
      </header>
      <PartsAdmin initialParts={parts} />
    </div>
  );
}
