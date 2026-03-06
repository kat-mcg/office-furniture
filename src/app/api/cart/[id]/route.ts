import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { inCart } = await req.json();
  const item = await prisma.furnitureItem.update({
    where: { id },
    data: { inCart: !!inCart },
  });
  return NextResponse.json(item);
}
