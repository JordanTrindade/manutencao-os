import Link from "next/link";
import { OrderForm } from "@/components/OrderForm";
import { listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function NovaOsPage() {
  const parts = listParts();

  return (
    <div>
      <header className="page-head">
        <div>
          <Link href="/" className="back">
            Ordens
          </Link>
          <h1>Nova ordem de serviço</h1>
          <p>Série e cliente são obrigatórios. O restante pode ser preenchido depois.</p>
        </div>
      </header>
      <OrderForm initialParts={parts} />
    </div>
  );
}
