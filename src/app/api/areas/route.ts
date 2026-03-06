import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const areas = await prisma.officeArea.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(areas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const area = await prisma.officeArea.create({
    data: {
      name: body.name,
      roomWidthCm: body.roomWidthCm ? parseFloat(body.roomWidthCm) : null,
      roomDepthCm: body.roomDepthCm ? parseFloat(body.roomDepthCm) : null,
    },
  });
  return NextResponse.json(area, { status: 201 });
}
