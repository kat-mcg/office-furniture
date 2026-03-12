import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.inCart !== undefined) data.inCart = !!body.inCart;
  if (body.quantity !== undefined) data.quantity = Math.max(1, parseInt(body.quantity) || 1);
  const item = await prisma.furnitureItem.update({
    where: { id },
    data,
  });
  return NextResponse.json(item);
}
