import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const area = await prisma.officeArea.update({
    where: { id },
    data: {
      name: body.name,
      roomWidthCm: body.roomWidthCm !== undefined ? (body.roomWidthCm ? parseFloat(body.roomWidthCm) : null) : undefined,
      roomDepthCm: body.roomDepthCm !== undefined ? (body.roomDepthCm ? parseFloat(body.roomDepthCm) : null) : undefined,
    },
  });
  return NextResponse.json(area);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Unassign furniture items first
  await prisma.furnitureItem.updateMany({
    where: { officeAreaId: id },
    data: { officeAreaId: null },
  });
  await prisma.officeArea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
