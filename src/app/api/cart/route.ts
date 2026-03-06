import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.furnitureItem.findMany({
    where: { inCart: true },
    include: { officeArea: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}
