import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.furnitureItem.findMany({
    where: { inCart: true },
    include: { officeArea: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}
