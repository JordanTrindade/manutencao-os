"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/SignaturePad";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { formatBRL, todayISODate } from "@/lib/format";
import {
  EQUIPMENT_SUBTYPES,
  SERVICE_TYPES,
  type EquipmentSubtype,
  type EquipmentType,
  type OrderPartInput,
  type Part,
  type ServiceOrder,
  type ServiceType,
} from "@/lib/types";

type FormState = {
  serial_number: string;
  equipment_type: EquipmentType;
  equipment_subtype: EquipmentSubtype;
  accessories: string;
  service_type: ServiceType;
  client_name: string;
  client_cnpj: string;
  quote_number: string;
  responsible_phone: string;
  problem_description: string;
  solution_notes: string;
  signature_data: string | null;
  pickup_name: string;
  pickup_rg: string;
  pickup_date: string;
  delivery_name: string;
  delivery_rg: string;
  delivery_date: string;
  status: ServiceOrder["status"];
  parts: OrderPartInput[];
};

function emptyForm(): FormState {
  return {
    serial_number: "",
    equipment_type: "Relógio",
    equipment_subtype: "Facial",
    accessories: "",
    service_type: "Manutenção",
    client_name: "",
    client_cnpj: "",
    quote_number: "",
    responsible_phone: "",
    problem_description: "",
    solution_notes: "",
    signature_data: null,
    pickup_name: "",
    pickup_rg: "",
    pickup_date: "",
    delivery_name: "",
    delivery_rg: "",
    delivery_date: todayISODate(),
    status: "aberta",
    parts: [],
  };
}

function fromOrder(order: ServiceOrder): FormState {
  return {
    serial_number: order.serial_number,
    equipment_type: order.equipment_type,
    equipment_subtype: order.equipment_subtype,
    accessories: order.accessories,
    service_type: order.service_type,
    client_name: order.client_name,
    client_cnpj: order.client_cnpj,
    quote_number: order.quote_number,
    responsible_phone: order.responsible_phone,
    problem_description: order.problem_description,
    solution_notes: order.solution_notes,
    signature_data: order.signature_data,
    pickup_name: order.pickup_name,
    pickup_rg: order.pickup_rg,
    pickup_date: order.pickup_date,
    delivery_name: order.delivery_name,
    delivery_rg: order.delivery_rg,
    delivery_date: order.delivery_date,
    status: order.status,
    parts: (order.parts || []).map((p) => ({
      part_id: p.part_id,
      part_name: p.part_name,
      part_price: p.part_price,
      quantity: p.quantity,
    })),
  };
}

export function OrderForm({
  initialOrder,
  initialParts = [],
}: {
  initialOrder?: ServiceOrder;
  initialParts?: Part[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    initialOrder ? fromOrder(initialOrder) : emptyForm(),
  );
  const [catalog, setCatalog] = useState<Part[]>(initialParts);
  const [selectedPartId, setSelectedPartId] = useState<string>(
    initialParts[0] ? String(initialParts[0].id) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialParts.length > 0) return;
    fetch("/api/parts")
      .then((r) => r.json())
      .then((data: Part[]) => {
        setCatalog(data);
        if (data[0]) setSelectedPartId(String(data[0].id));
      })
      .catch(() => setError("Não foi possível carregar o catálogo de peças."));
  }, [initialParts.length]);

  const subtypes = EQUIPMENT_SUBTYPES[form.equipment_type];

  const partsTotal = useMemo(
    () => form.parts.reduce((sum, p) => sum + p.part_price * p.quantity, 0),
    [form.parts],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onEquipmentTypeChange(type: EquipmentType) {
    setForm((prev) => ({
      ...prev,
      equipment_type: type,
      equipment_subtype: EQUIPMENT_SUBTYPES[type][0],
    }));
  }

  function addPart() {
    const part = catalog.find((p) => String(p.id) === selectedPartId);
    if (!part) return;
    setForm((prev) => {
      const existing = prev.parts.find((p) => p.part_id === part.id);
      if (existing) {
        return {
          ...prev,
          parts: prev.parts.map((p) =>
            p.part_id === part.id ? { ...p, quantity: p.quantity + 1 } : p,
          ),
        };
      }
      return {
        ...prev,
        parts: [
          ...prev.parts,
          {
            part_id: part.id,
            part_name: part.name,
            part_price: part.price,
            quantity: 1,
          },
        ],
      };
    });
  }

  function setPartQty(index: number, quantity: number) {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map((p, i) =>
        i === index ? { ...p, quantity: Math.max(1, quantity) } : p,
      ),
    }));
  }

  function removePart(index: number) {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const isEdit = Boolean(initialOrder);
      const res = await fetch(
        isEdit ? `/api/orders/${initialOrder!.id}` : "/api/orders",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao salvar OS.");
      }
      setMessage(isEdit ? "OS atualizada." : "OS criada com sucesso.");
      router.push(`/os/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initialOrder) return;
    if (!confirm(`Excluir OS #${initialOrder.id}?`)) return;
    const res = await fetch(`/api/orders/${initialOrder.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Não foi possível excluir a OS.");
    }
  }

  const previewOrder: ServiceOrder | null = initialOrder
    ? {
        ...initialOrder,
        ...form,
        parts: form.parts.map((part, index) => ({
          id: index,
          order_id: initialOrder.id,
          ...part,
        })),
      }
    : null;

  return (
    <form onSubmit={onSubmit} className="sheet-grid">
      <div className="card">
        <section className="section">
          <h2>Equipamento</h2>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="serial_number">Nº de série</label>
              <input
                id="serial_number"
                required
                value={form.serial_number}
                onChange={(e) => update("serial_number", e.target.value)}
                placeholder="SN-2026-0041"
              />
            </div>
            <div className="field">
              <label htmlFor="service_type">Tipo de serviço</label>
              <select
                id="service_type"
                value={form.service_type}
                onChange={(e) => update("service_type", e.target.value as ServiceType)}
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="equipment_type">Equipamento</label>
              <select
                id="equipment_type"
                value={form.equipment_type}
                onChange={(e) => onEquipmentTypeChange(e.target.value as EquipmentType)}
              >
                <option value="Relógio">Relógio</option>
                <option value="Catraca">Catraca</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="equipment_subtype">Modelo</label>
              <select
                id="equipment_subtype"
                value={form.equipment_subtype}
                onChange={(e) =>
                  update("equipment_subtype", e.target.value as EquipmentSubtype)
                }
              >
                {subtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="accessories">Acompanha</label>
            <textarea
              id="accessories"
              value={form.accessories}
              onChange={(e) => update("accessories", e.target.value)}
              placeholder="Fonte, cabos, suporte, chave"
            />
          </div>
        </section>

        <section className="section">
          <h2>Cliente</h2>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="client_name">Nome</label>
              <input
                id="client_name"
                required
                value={form.client_name}
                onChange={(e) => update("client_name", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="client_cnpj">CNPJ</label>
              <input
                id="client_cnpj"
                value={form.client_cnpj}
                onChange={(e) => update("client_cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="field">
              <label htmlFor="quote_number">Orçamento</label>
              <input
                id="quote_number"
                value={form.quote_number}
                onChange={(e) => update("quote_number", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="responsible_phone">Telefone</label>
              <input
                id="responsible_phone"
                value={form.responsible_phone}
                onChange={(e) => update("responsible_phone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Problema e solução</h2>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="problem_description">Problema</label>
              <textarea
                id="problem_description"
                value={form.problem_description}
                onChange={(e) => update("problem_description", e.target.value)}
                placeholder="Relógio não reconhece face, catraca travando no giro"
              />
            </div>
            <div className="field">
              <label htmlFor="solution_notes">Solução</label>
              <textarea
                id="solution_notes"
                value={form.solution_notes}
                onChange={(e) => update("solution_notes", e.target.value)}
              />
            </div>
          </div>

          <div className="parts-add" style={{ marginTop: 14 }}>
            <div className="field">
              <label htmlFor="part_pick">Peça do catálogo</label>
              <select
                id="part_pick"
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
              >
                {catalog.length === 0 && <option value="">Nenhuma peça cadastrada</option>}
                {catalog.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} — {formatBRL(part.price)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-secondary" onClick={addPart}>
              Adicionar
            </button>
          </div>

          {form.parts.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table className="data" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th>Preço</th>
                    <th>Qtd</th>
                    <th>Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {form.parts.map((part, index) => (
                    <tr key={`${part.part_id}-${index}`}>
                      <td>{part.part_name}</td>
                      <td>{formatBRL(part.part_price)}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="qty"
                          style={{ width: 72 }}
                          value={part.quantity}
                          onChange={(e) => setPartQty(index, Number(e.target.value))}
                          aria-label={`Quantidade de ${part.part_name}`}
                        />
                      </td>
                      <td className="num">{formatBRL(part.part_price * part.quantity)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removePart(index)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-line">Total {formatBRL(partsTotal)}</div>
            </div>
          )}
        </section>

        <section className="section">
          <h2>Assinatura</h2>
          <SignaturePad
            value={form.signature_data}
            onChange={(data) => update("signature_data", data)}
          />
        </section>

        <section className="section">
          <h2>Entrega e recolhimento</h2>
          <div className="handover">
            <div className="handover-box">
              <h3>Entrega no laboratório</h3>
              <div className="field">
                <label htmlFor="delivery_name">Nome</label>
                <input
                  id="delivery_name"
                  value={form.delivery_name}
                  onChange={(e) => update("delivery_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="delivery_rg">RG</label>
                <input
                  id="delivery_rg"
                  value={form.delivery_rg}
                  onChange={(e) => update("delivery_rg", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="delivery_date">Data</label>
                <input
                  id="delivery_date"
                  type="date"
                  value={form.delivery_date}
                  onChange={(e) => update("delivery_date", e.target.value)}
                />
              </div>
            </div>
            <div className="handover-box">
              <h3>Recolhido pelo cliente</h3>
              <div className="field">
                <label htmlFor="pickup_name">Nome</label>
                <input
                  id="pickup_name"
                  value={form.pickup_name}
                  onChange={(e) => update("pickup_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pickup_rg">RG</label>
                <input
                  id="pickup_rg"
                  value={form.pickup_rg}
                  onChange={(e) => update("pickup_rg", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pickup_date">Data</label>
                <input
                  id="pickup_date"
                  type="date"
                  value={form.pickup_date}
                  onChange={(e) => update("pickup_date", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="card sheet-side">
        <div>
          <div className="field">
            <label id="status-label">Status</label>
            <div className="segment" role="group" aria-labelledby="status-label">
              {(
                [
                  ["aberta", "Aberta"],
                  ["concluida", "Concluída"],
                  ["entregue", "Entregue"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={form.status === value}
                  onClick={() => update("status", value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="summary-row">
            <span>Cliente</span>
            <strong>{form.client_name || "—"}</strong>
          </div>
          <div className="summary-row">
            <span>Série</span>
            <strong>{form.serial_number || "—"}</strong>
          </div>
          <div className="summary-row">
            <span>Equipamento</span>
            <strong>
              {form.equipment_type} {form.equipment_subtype}
            </strong>
          </div>
          <div className="summary-row">
            <span>Serviço</span>
            <strong>{form.service_type}</strong>
          </div>
          <div className="summary-row">
            <span>Peças</span>
            <strong>{formatBRL(partsTotal)}</strong>
          </div>
        </div>

        {(error || message) && (
          <div className={`notice ${error ? "notice-error" : "notice-ok"}`}>
            {error || message}
          </div>
        )}

        <div className="side-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Salvando…" : initialOrder ? "Salvar" : "Criar OS"}
          </button>
          {previewOrder && <ExportPdfButton order={previewOrder} />}
          {initialOrder && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Excluir
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}
