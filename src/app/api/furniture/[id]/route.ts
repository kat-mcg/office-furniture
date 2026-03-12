import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.furnitureItem.findUnique({
    where: { id },
    include: { officeArea: true, category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // Only update fields that are explicitly provided in the request body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if ("title" in body) data.title = body.title;
  if ("url" in body) data.url = body.url || null;
  if ("imageUrl" in body) data.imageUrl = body.imageUrl || null;
  if ("price" in body) data.price = body.price ? parseFloat(body.price) : null;
  if ("widthCm" in body) data.widthCm = body.widthCm ? parseFloat(body.widthCm) : null;
  if ("depthCm" in body) data.depthCm = body.depthCm ? parseFloat(body.depthCm) : null;
  if ("heightCm" in body) data.heightCm = body.heightCm ? parseFloat(body.heightCm) : null;
  if ("material" in body) data.material = body.material || null;
  if ("description" in body) data.description = body.description || null;
  if ("leadTimeDays" in body)
    data.leadTimeDays = body.leadTimeDays ? parseInt(body.leadTimeDays) : null;
  if ("quantity" in body) data.quantity = body.quantity ? parseInt(body.quantity) : 1;
  if ("officeAreaId" in body) data.officeAreaId = body.officeAreaId || null;
  if ("categoryId" in body) data.categoryId = body.categoryId || null;

  const item = await prisma.furnitureItem.update({
    where: { id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.furnitureItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
