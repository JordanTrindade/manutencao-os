"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import type { Part } from "@/lib/types";

export function PartsAdmin({ initialParts = [] }: { initialParts?: Part[] }) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/parts");
      const data = await res.json();
      setParts(data);
    } catch {
      setError("Falha ao carregar peças.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialParts.length === 0) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(part: Part) {
    setEditingId(part.id);
    setName(part.name);
    setPrice(String(part.price));
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: name.trim(), price: Number(price.replace(",", ".")) };

    const res = await fetch(
      editingId ? `/api/parts/${editingId}` : "/api/parts",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Não foi possível salvar.");
      return;
    }
    resetForm();
    await load();
  }

  async function onDelete(id: number) {
    if (!confirm("Excluir esta peça do catálogo?")) return;
    const res = await fetch(`/api/parts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Não foi possível excluir.");
      return;
    }
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <section className="card">
      <form onSubmit={onSubmit} className="toolbar">
        <div className="search">
          <div className="field" style={{ flex: 2 }}>
            <label htmlFor="part_name">{editingId ? "Editar nome" : "Nome"}</label>
            <input
              id="part_name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fonte 12V"
            />
          </div>
          <div className="field" style={{ width: 140, flex: "0 0 140px" }}>
            <label htmlFor="part_price">Preço</label>
            <input
              id="part_price"
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <div className="filters">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Salvar" : "Adicionar"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {error && (
        <div className="notice notice-error" style={{ margin: 12 }}>
          {error}
        </div>
      )}
      {loading ? (
        <div className="empty">Carregando catálogo…</div>
      ) : parts.length === 0 ? (
        <div className="empty">
          <strong>Nenhuma peça cadastrada</strong>
          Inclua o nome e o preço acima.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className={editingId === part.id ? "row-active" : undefined}>
                  <td>{part.name}</td>
                  <td className="num">{formatBRL(part.price)}</td>
                  <td>
                    <div className="filters">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(part)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(part.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
