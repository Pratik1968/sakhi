import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mirrors the demo data from the app's src/data/sakhi.ts so a fresh DB shows a
// realistic circle. Password for every seeded account is "password123".
async function main() {
  const password = await bcrypt.hash('password123', 10);

  const meera = await prisma.user.upsert({
    where: { email: 'meera@sakhi.app' },
    update: {},
    create: { name: 'Meera R', email: 'meera@sakhi.app', phone: '+910000000001', passwordHash: password },
  });

  const guardians = [
    { name: 'Priya Sharma', email: 'priya@sakhi.app', status: 'ACTIVE' },
    { name: 'Nikhil Rao', email: 'nikhil@sakhi.app', status: 'SOS_ONLY' },
    { name: 'Divya Kulkarni', email: 'divya@sakhi.app', status: 'PENDING' },
  ];

  for (const g of guardians) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: { name: g.name, email: g.email, passwordHash: password },
    });
    const existing = await prisma.guardianLink.findFirst({
      where: { ownerId: meera.id, guardianUserId: user.id },
    });
    if (!existing) {
      await prisma.guardianLink.create({
        data: {
          ownerId: meera.id,
          guardianUserId: user.id,
          name: g.name,
          inviteeContact: g.email,
          status: g.status,
        },
      });
    }
  }

  await prisma.locationPing.create({
    data: { userId: meera.id, lat: 12.9722, lng: 77.6405, accuracy: 8 },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded demo users. Login as meera@sakhi.app / password123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
