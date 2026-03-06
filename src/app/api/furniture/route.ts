import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.furnitureItem.findMany({
    include: { officeArea: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.furnitureItem.create({
    data: {
      title: body.title,
      url: body.url || null,
      imageUrl: body.imageUrl || null,
      price: body.price ? parseFloat(body.price) : null,
      widthCm: body.widthCm ? parseFloat(body.widthCm) : null,
      depthCm: body.depthCm ? parseFloat(body.depthCm) : null,
      heightCm: body.heightCm ? parseFloat(body.heightCm) : null,
      material: body.material || null,
      description: body.description || null,
      leadTimeDays: body.leadTimeDays ? parseInt(body.leadTimeDays) : null,
      quantity: body.quantity ? parseInt(body.quantity) : 1,
      officeAreaId: body.officeAreaId || null,
      categoryId: body.categoryId || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
