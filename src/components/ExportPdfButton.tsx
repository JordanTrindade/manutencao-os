"use client";

import { useState } from "react";
import { exportOrderPdf } from "@/lib/export-pdf";
import type { ServiceOrder } from "@/lib/types";

export function ExportPdfButton({ order }: { order: ServiceOrder }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportOrderPdf(order);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleExport}
      disabled={busy}
    >
      {busy ? "Gerando PDF…" : "Exportar PDF"}
    </button>
  );
}
