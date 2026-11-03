import { NextRequest, NextResponse } from "next/server";
import { deletePart, getPart, updatePart } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const part = getPart(Number(id));
  if (!part) {
    return NextResponse.json({ error: "Peça não encontrada." }, { status: 404 });
  }
  return NextResponse.json(part);
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name || "").trim();
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json({ error: "Nome da peça é obrigatório." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
    }

    const part = updatePart(Number(id), name, price);
    if (!part) {
      return NextResponse.json({ error: "Peça não encontrada." }, { status: 404 });
    }
    return NextResponse.json(part);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar peça." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deletePart(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "Peça não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
