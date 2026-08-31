import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { name: "Alex Morgan", email: "alex@ajaia.demo" },
  { name: "Jordan Lee", email: "jordan@ajaia.demo" },
  { name: "Taylor Kim", email: "taylor@ajaia.demo" },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name }, create: user });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
