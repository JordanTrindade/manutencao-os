import { jsPDF } from "jspdf";
import { formatBRL, formatDateBR, formatDateTimeBR } from "./format";
import type { ServiceOrder } from "./types";

export async function exportOrderPdf(order: ServiceOrder) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  let y = 18;

  const line = (text: string, size = 11, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 210 - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.45) + 2;
  };

  const section = (title: string) => {
    y += 3;
    doc.setDrawColor(15, 92, 110);
    doc.setLineWidth(0.4);
    doc.line(margin, y, 210 - margin, y);
    y += 7;
    line(title, 13, "bold");
  };

  line("Smart Empresarial — Ordem de Serviço", 16, "bold");
  line(`OS #${order.id}  ·  ${formatDateTimeBR(order.created_at)}`, 10);
  line(`Status: ${order.status}`, 10);

  section("Equipamento");
  line(`Nº de série: ${order.serial_number}`);
  line(`Tipo: ${order.equipment_type} / ${order.equipment_subtype}`);
  line(`Serviço: ${order.service_type}`);
  line(`O que veio junto: ${order.accessories || "—"}`);

  section("Cliente");
  line(`Nome: ${order.client_name}`);
  line(`CNPJ: ${order.client_cnpj || "—"}`);
  line(`Nº orçamento: ${order.quote_number || "—"}`);
  line(`Telefone responsável: ${order.responsible_phone || "—"}`);

  section("Problema apresentado");
  line(order.problem_description || "—");

  section("Solução / Peças");
  line(order.solution_notes || "Sem notas de solução.");
  const parts = order.parts || [];
  if (parts.length === 0) {
    line("Nenhuma peça trocada.");
  } else {
    let total = 0;
    for (const part of parts) {
      const subtotal = part.part_price * part.quantity;
      total += subtotal;
      line(
        `• ${part.part_name} × ${part.quantity} — ${formatBRL(part.part_price)} (subtotal ${formatBRL(subtotal)})`,
      );
    }
    line(`Total peças: ${formatBRL(total)}`, 11, "bold");
  }

  section("Entrega / Recolhimento");
  line(
    `Entregue por: ${order.delivery_name || "—"} · RG ${order.delivery_rg || "—"} · ${formatDateBR(order.delivery_date)}`,
  );
  line(
    `Recolhido por: ${order.pickup_name || "—"} · RG ${order.pickup_rg || "—"} · ${formatDateBR(order.pickup_date)}`,
  );

  section("Assinatura");
  if (order.signature_data) {
    try {
      doc.addImage(order.signature_data, "PNG", margin, y, 70, 28);
      y += 32;
    } catch {
      line("Assinatura disponível no sistema (não foi possível embutir no PDF).");
    }
  } else {
    line("Sem assinatura.");
  }

  doc.save(`OS-${order.id}-${order.serial_number}.pdf`);
}
