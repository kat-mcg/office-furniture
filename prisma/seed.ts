import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create office areas
  const reception = await prisma.officeArea.upsert({
    where: { name: "Reception" },
    update: {},
    create: { name: "Reception", roomWidthCm: 500, roomDepthCm: 400 },
  });

  const openOffice = await prisma.officeArea.upsert({
    where: { name: "Open Office" },
    update: {},
    create: { name: "Open Office", roomWidthCm: 1200, roomDepthCm: 800 },
  });

  const meetingRoom = await prisma.officeArea.upsert({
    where: { name: "Meeting Room" },
    update: {},
    create: { name: "Meeting Room", roomWidthCm: 400, roomDepthCm: 350 },
  });

  await prisma.officeArea.upsert({
    where: { name: "Kitchen" },
    update: {},
    create: { name: "Kitchen", roomWidthCm: 300, roomDepthCm: 250 },
  });

  await prisma.officeArea.upsert({
    where: { name: "CEO Office" },
    update: {},
    create: { name: "CEO Office", roomWidthCm: 500, roomDepthCm: 400 },
  });

  await prisma.officeArea.upsert({
    where: { name: "Storage" },
    update: {},
    create: { name: "Storage", roomWidthCm: 200, roomDepthCm: 300 },
  });

  // Create categories
  const catChair = await prisma.category.upsert({
    where: { name: "Chair" },
    update: {},
    create: { name: "Chair" },
  });

  const catDesk = await prisma.category.upsert({
    where: { name: "Desk" },
    update: {},
    create: { name: "Desk" },
  });

  const catTable = await prisma.category.upsert({
    where: { name: "Table" },
    update: {},
    create: { name: "Table" },
  });

  await prisma.category.upsert({
    where: { name: "Storage" },
    update: {},
    create: { name: "Storage" },
  });

  await prisma.category.upsert({
    where: { name: "Lighting" },
    update: {},
    create: { name: "Lighting" },
  });

  await prisma.category.upsert({
    where: { name: "Accessory" },
    update: {},
    create: { name: "Accessory" },
  });

  // Create sample furniture items
  await prisma.furnitureItem.create({
    data: {
      title: "Ergonomic Mesh Office Chair - Adjustable Lumbar Support",
      url: "https://example.com/office-chair",
      imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
      price: 349.99,
      widthCm: 65,
      depthCm: 65,
      heightCm: 115,
      material: "Mesh",
      description:
        "High-back ergonomic chair with adjustable lumbar support, armrests, and headrest. Breathable mesh back for all-day comfort.",
      leadTimeDays: 14,
      quantity: 12,
      officeAreaId: openOffice.id,
      categoryId: catChair.id,
    },
  });

  await prisma.furnitureItem.create({
    data: {
      title: "Standing Desk - Electric Height Adjustable 160x80cm",
      url: "https://example.com/standing-desk",
      imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop",
      price: 599.0,
      widthCm: 160,
      depthCm: 80,
      heightCm: 125,
      material: "Wood",
      description:
        "Electric sit-stand desk with memory presets. Bamboo top with steel frame. Quiet dual-motor system.",
      leadTimeDays: 21,
      quantity: 12,
      officeAreaId: openOffice.id,
      categoryId: catDesk.id,
    },
  });

  await prisma.furnitureItem.create({
    data: {
      title: "Conference Table - Oval 240x120cm",
      url: "https://example.com/conference-table",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
      price: 1299.0,
      widthCm: 240,
      depthCm: 120,
      heightCm: 75,
      material: "Walnut",
      description:
        "Large oval conference table in walnut veneer. Seats 8-10 people. Built-in cable management ports.",
      leadTimeDays: 35,
      quantity: 1,
      officeAreaId: meetingRoom.id,
      categoryId: catTable.id,
    },
  });

  // Create default settings
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", moveInDate: null },
  });

  console.log("Seed data created successfully!");
  console.log("- 6 office areas");
  console.log("- 6 categories");
  console.log("- 3 sample furniture items");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
