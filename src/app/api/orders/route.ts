import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db";
import type { ServiceOrderInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || undefined;
  return NextResponse.json(listOrders(q));
}

export async function POST(request: NextRequest) {
  try {
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
    if (!body.equipment_type || !body.equipment_subtype || !body.service_type) {
      return NextResponse.json(
        { error: "Tipo de equipamento e serviço são obrigatórios." },
        { status: 400 },
      );
    }

    const order = createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar ordem de serviço." }, { status: 500 });
  }
}
