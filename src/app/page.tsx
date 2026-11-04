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
    <div>
      <header className="page-head">
        <div>
          <h1>Ordens de serviço</h1>
          <p>Fila de relógios e catracas no laboratório.</p>
        </div>
        <Link href="/os/nova" className="btn btn-primary">
          Nova OS
        </Link>
      </header>
      <OrderList initialOrders={orders} initialQuery={q || ""} />
    </div>
  );
}
