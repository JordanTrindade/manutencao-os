"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatBRL, formatDateTimeBR } from "@/lib/format";
import type { ServiceOrder } from "@/lib/types";

type StatusFilter = "todas" | ServiceOrder["status"];

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
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [searching, setSearching] = useState(false);

  const counts = useMemo(() => {
    return {
      todas: orders.length,
      aberta: orders.filter((order) => order.status === "aberta").length,
      concluida: orders.filter((order) => order.status === "concluida").length,
      entregue: orders.filter((order) => order.status === "entregue").length,
    };
  }, [orders]);

  const visible = useMemo(
    () => (status === "todas" ? orders : orders.filter((order) => order.status === status)),
    [orders, status],
  );

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

  async function clearSearch() {
    setQuery("");
    setStatus("todas");
    router.replace("/");
    const res = await fetch("/api/orders");
    setOrders(await res.json());
  }

  const filters: Array<{ id: StatusFilter; label: string }> = [
    { id: "todas", label: `Todas ${counts.todas}` },
    { id: "aberta", label: `Abertas ${counts.aberta}` },
    { id: "concluida", label: `Concluídas ${counts.concluida}` },
    { id: "entregue", label: `Entregues ${counts.entregue}` },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <form onSubmit={search} className="search">
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Série ou cliente"
            aria-label="Buscar OS"
          />
          <button type="submit" className="btn btn-ghost" disabled={searching}>
            {searching ? "Buscando…" : "Buscar"}
          </button>
          {query && (
            <button type="button" className="btn btn-ghost" onClick={clearSearch}>
              Limpar
            </button>
          )}
        </form>
        <div className="filters" role="tablist" aria-label="Filtrar por status">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`chip${status === filter.id ? " active" : ""}`}
              onClick={() => setStatus(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <strong>Nenhuma OS nesta visão</strong>
          Ajuste a busca ou o status, ou abra uma nova ordem.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>OS</th>
                <th>Cliente</th>
                <th>Equipamento</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Peças</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const label = statusLabel(order.status);
                const partsTotal = (order.parts || []).reduce(
                  (sum, part) => sum + part.part_price * part.quantity,
                  0,
                );
                return (
                  <tr
                    key={order.id}
                    className="clickable"
                    tabIndex={0}
                    onClick={() => router.push(`/os/${order.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/os/${order.id}`);
                      }
                    }}
                  >
                    <td>
                      <span className="num">#{order.id}</span>
                      <span className="sub">{formatDateTimeBR(order.created_at)}</span>
                    </td>
                    <td>
                      {order.client_name}
                      <span className="sub">{order.quote_number || "Sem orçamento"}</span>
                    </td>
                    <td>
                      {order.equipment_type} {order.equipment_subtype}
                      <span className="sub">Série {order.serial_number}</span>
                    </td>
                    <td>{order.service_type}</td>
                    <td>
                      <span className={label.className}>{label.text}</span>
                    </td>
                    <td className="num">{formatBRL(partsTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
