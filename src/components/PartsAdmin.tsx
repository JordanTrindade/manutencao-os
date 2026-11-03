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
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="panel p-5 sm:p-6">
        <h2 className="section-title">
          {editingId ? "Editar peça" : "Cadastrar peça"}
        </h2>
        <p className="section-copy">
          Catálogo usado na seleção de peças trocadas nas ordens de serviço.
        </p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="part_name">Nome</label>
            <input
              id="part_name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Fonte 12V"
            />
          </div>
          <div className="field">
            <label htmlFor="part_price">Preço (R$)</label>
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
        {error && (
          <div className="mt-4 rounded-xl bg-[#fde8e6] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Salvar peça" : "Adicionar peça"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h2 className="section-title mb-0">Catálogo</h2>
        </div>
        {loading ? (
          <p className="p-6 text-[var(--muted)]">Carregando…</p>
        ) : parts.length === 0 ? (
          <p className="p-6 text-[var(--muted)]">Nenhuma peça cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--bg-accent)] text-left text-[var(--muted)]">
                  <th className="px-5 py-3 font-semibold sm:px-6">Nome</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Preço</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Ações</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-t border-[var(--line)]">
                    <td className="px-5 py-3 sm:px-6">{part.name}</td>
                    <td className="px-5 py-3 sm:px-6">{formatBRL(part.price)}</td>
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary px-3 py-1 text-xs"
                          onClick={() => startEdit(part)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger px-3 py-1 text-xs"
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
    </div>
  );
}
