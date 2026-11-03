import { NextRequest, NextResponse } from "next/server";
import { createPart, listParts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listParts());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json({ error: "Nome da peça é obrigatório." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
    }

    const part = createPart(name, price);
    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar peça." }, { status: 500 });
  }
}
