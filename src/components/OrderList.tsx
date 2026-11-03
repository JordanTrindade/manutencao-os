"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatBRL, formatDateTimeBR } from "@/lib/format";
import type { ServiceOrder } from "@/lib/types";

function statusLabel(status: ServiceOrder["status"]) {
  switch (status) {
    case "concluida":
      return { text: "Concluída", className: "badge badge-ok" };
    case "entregue":
      return { text: "Entregue", className: "badge badge-warn" };
    default:
      return { text: "Aberta", className: "badge" };
  }
}

export function OrderList({
  initialOrders,
  initialQuery = "",
}: {
  initialOrders: ServiceOrder[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState(initialOrders);
  const [searching, setSearching] = useState(false);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setSearching(true);
    try {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setOrders(data);
      const url = query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/";
      router.replace(url);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={search} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="field flex-1">
          <label htmlFor="search">Buscar OS</label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nº de série ou nome do cliente"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? "Buscando…" : "Buscar"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery("");
              setOrders(initialOrders);
              router.replace("/");
              fetch("/api/orders")
                .then((r) => r.json())
                .then(setOrders);
            }}
          >
            Limpar
          </button>
        </div>
      </form>

      {orders.length === 0 ? (
        <div className="panel p-8 text-center">
          <h2 className="section-title">Nenhuma OS encontrada</h2>
          <p className="section-copy mb-0">
            Crie a primeira ordem ou ajuste os termos da busca.
          </p>
          <Link href="/os/nova" className="btn btn-primary mt-4 inline-flex">
            Nova OS
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const status = statusLabel(order.status);
            const partsTotal = (order.parts || []).reduce(
              (sum, p) => sum + p.part_price * p.quantity,
              0,
            );
            return (
              <Link
                key={order.id}
                href={`/os/${order.id}`}
                className="panel block p-5 transition hover:-translate-y-0.5 hover:border-[var(--brand)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      OS #{order.id} · {formatDateTimeBR(order.created_at)}
                    </div>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-tight">
                      {order.client_name}
                    </h3>
                    <p className="mt-1 text-[var(--muted)]">
                      Série {order.serial_number} · {order.equipment_type}{" "}
                      {order.equipment_subtype} · {order.service_type}
                    </p>
                  </div>
                  <span className={status.className}>{status.text}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                  <span>Peças: {formatBRL(partsTotal)}</span>
                  <span>Orçamento: {order.quote_number || "—"}</span>
                  <span>Tel.: {order.responsible_phone || "—"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
