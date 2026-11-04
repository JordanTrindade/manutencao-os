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
    <div>
      <header className="page-head">
        <div>
          <Link href="/" className="back">
            Ordens
          </Link>
          <h1>OS #{order.id}</h1>
          <p>
            {order.client_name} · Série {order.serial_number}
          </p>
        </div>
      </header>
      <OrderForm initialOrder={order} initialParts={parts} />
    </div>
  );
}
