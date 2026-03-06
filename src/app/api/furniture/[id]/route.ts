import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.furnitureItem.findUnique({
    where: { id },
    include: { officeArea: true, category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const item = await prisma.furnitureItem.update({
    where: { id },
    data: {
      title: body.title,
      url: body.url || null,
      imageUrl: body.imageUrl || null,
      price: body.price !== undefined ? (body.price ? parseFloat(body.price) : null) : undefined,
      widthCm: body.widthCm !== undefined ? (body.widthCm ? parseFloat(body.widthCm) : null) : undefined,
      depthCm: body.depthCm !== undefined ? (body.depthCm ? parseFloat(body.depthCm) : null) : undefined,
      heightCm: body.heightCm !== undefined ? (body.heightCm ? parseFloat(body.heightCm) : null) : undefined,
      material: body.material || null,
      description: body.description || null,
      leadTimeDays: body.leadTimeDays !== undefined ? (body.leadTimeDays ? parseInt(body.leadTimeDays) : null) : undefined,
      quantity: body.quantity ? parseInt(body.quantity) : 1,
      officeAreaId: body.officeAreaId || null,
      categoryId: body.categoryId || null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.furnitureItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
