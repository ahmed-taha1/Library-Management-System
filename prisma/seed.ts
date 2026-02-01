import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Taha@bosta', 10);

  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@bosta.com' },
    update: {},
    create: {
      name: 'Librarian',
      email: 'librarian@bosta.com',
      passwordHash,
      phoneNumber: '0000000000',
      address: 'Library HQ',
      role: 'librarian',
    },
  });

  const borrower = await prisma.user.upsert({
    where: { email: 'borrower@bosta.com' },
    update: {},
    create: {
      name: 'Borrower',
      email: 'borrower@bosta.com',
      passwordHash,
      phoneNumber: '0000000000',
      address: 'Cairo, Egypt',
      role: 'borrower',
    },
  });

  console.log({ librarian, borrower });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
