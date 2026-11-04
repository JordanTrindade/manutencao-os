"use client";

import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

type Props = {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
};

export function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255,255,255)",
      penColor: "rgb(21,32,43)",
      minWidth: 1.2,
      maxWidth: 2.8,
    });
    padRef.current = pad;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = pad.isEmpty() ? null : pad.toDataURL("image/png");
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);
      pad.clear();
      if (data) {
        pad.fromDataURL(data);
      } else if (value) {
        pad.fromDataURL(value);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    pad.addEventListener("endStroke", () => {
      onChange(pad.isEmpty() ? null : pad.toDataURL("image/png"));
    });

    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
      padRef.current = null;
    };
    // intentionally mount-only; value hydrate handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    if (!value) {
      if (!pad.isEmpty()) pad.clear();
      return;
    }
    const current = pad.isEmpty() ? null : pad.toDataURL("image/png");
    if (current !== value) {
      pad.fromDataURL(value);
    }
  }, [value]);

  function clear() {
    padRef.current?.clear();
    onChange(null);
  }

  return (
    <div>
      <div
        className="overflow-hidden bg-white"
        style={{ border: "1px solid var(--line-strong)", borderRadius: 8 }}
      >
        <canvas
          ref={canvasRef}
          className="h-36 w-full touch-none"
          aria-label="Área de assinatura"
        />
      </div>
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={clear}>
        Limpar
      </button>
    </div>
  );
}
