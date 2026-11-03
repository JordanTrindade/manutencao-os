import { NextRequest, NextResponse } from "next/server";
import { deleteOrder, getOrder, updateOrder } from "@/lib/db";
import type { ServiceOrderInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const order = getOrder(Number(id));
  if (!order) {
    return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ServiceOrderInput;

    if (!body.serial_number?.trim()) {
      return NextResponse.json(
        { error: "Nº de série é obrigatório." },
        { status: 400 },
      );
    }
    if (!body.client_name?.trim()) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório." },
        { status: 400 },
      );
    }

    const order = updateOrder(Number(id), body);
    if (!order) {
      return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar OS." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteOrder(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
