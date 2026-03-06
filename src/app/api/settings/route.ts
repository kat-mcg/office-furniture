import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: "singleton" },
    });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { moveInDate: body.moveInDate || null },
    create: { id: "singleton", moveInDate: body.moveInDate || null },
  });
  return NextResponse.json(settings);
}
