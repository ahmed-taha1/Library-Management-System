import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.', quantity: 5, shelf: 'A1', section: 'Fiction' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', description: 'A novel about racial injustice in the American South.', quantity: 3, shelf: 'A2', section: 'Fiction' },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', description: 'A dystopian novel about totalitarianism.', quantity: 4, shelf: 'A3', section: 'Fiction' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', description: 'A romantic novel about manners and matrimony.', quantity: 3, shelf: 'A4', section: 'Fiction' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', description: 'A story about teenage alienation and loss.', quantity: 2, shelf: 'A5', section: 'Fiction' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', description: 'A fantasy novel about Bilbo Baggins adventure.', quantity: 4, shelf: 'B1', section: 'Fantasy' },
  { title: 'Harry Potter and the Sorcerers Stone', author: 'J.K. Rowling', isbn: '9780590353427', description: 'The first book in the Harry Potter series.', quantity: 6, shelf: 'B2', section: 'Fantasy' },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780618640157', description: 'An epic high fantasy novel.', quantity: 3, shelf: 'B3', section: 'Fantasy' },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', isbn: '9780553593716', description: 'The first book in A Song of Ice and Fire series.', quantity: 4, shelf: 'B4', section: 'Fantasy' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', description: 'A fantasy novel about Kvothe.', quantity: 2, shelf: 'B5', section: 'Fantasy' },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', description: 'A handbook of agile software craftsmanship.', quantity: 5, shelf: 'C1', section: 'Technology' },
  { title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780135957059', description: 'Your journey to mastery in programming.', quantity: 3, shelf: 'C2', section: 'Technology' },
  { title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', description: 'Elements of reusable object-oriented software.', quantity: 2, shelf: 'C3', section: 'Technology' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', description: 'A comprehensive textbook on algorithms.', quantity: 4, shelf: 'C4', section: 'Technology' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '9780596517748', description: 'A deep dive into the JavaScript language.', quantity: 3, shelf: 'C5', section: 'Technology' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', description: 'A landmark volume in science writing.', quantity: 3, shelf: 'D1', section: 'Science' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', description: 'A brief history of humankind.', quantity: 4, shelf: 'D2', section: 'Science' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780199291151', description: 'A book on evolution and genetics.', quantity: 2, shelf: 'D3', section: 'Science' },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', description: 'A journey through space and time.', quantity: 3, shelf: 'D4', section: 'Science' },
  { title: 'The Origin of Species', author: 'Charles Darwin', isbn: '9780451529060', description: 'The foundation of evolutionary biology.', quantity: 2, shelf: 'D5', section: 'Science' },
  { title: 'The Art of War', author: 'Sun Tzu', isbn: '9781590302255', description: 'Ancient Chinese military treatise.', quantity: 4, shelf: 'E1', section: 'Philosophy' },
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780140449334', description: 'Personal writings of the Roman Emperor.', quantity: 3, shelf: 'E2', section: 'Philosophy' },
  { title: 'Beyond Good and Evil', author: 'Friedrich Nietzsche', isbn: '9780140449235', description: 'A critique of past philosophers.', quantity: 2, shelf: 'E3', section: 'Philosophy' },
  { title: 'The Republic', author: 'Plato', isbn: '9780140455113', description: 'Socratic dialogue on justice.', quantity: 3, shelf: 'E4', section: 'Philosophy' },
  { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', isbn: '9780140441185', description: 'A philosophical novel.', quantity: 2, shelf: 'E5', section: 'Philosophy' },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', description: 'A magical story about following your dreams.', quantity: 5, shelf: 'F1', section: 'Fiction' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel Garcia Marquez', isbn: '9780060883287', description: 'A landmark of magical realism.', quantity: 3, shelf: 'F2', section: 'Fiction' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '9780143058144', description: 'A psychological drama.', quantity: 2, shelf: 'F3', section: 'Fiction' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', isbn: '9780374528379', description: 'A passionate philosophical novel.', quantity: 2, shelf: 'F4', section: 'Fiction' },
  { title: 'War and Peace', author: 'Leo Tolstoy', isbn: '9781400079988', description: 'An epic novel of Russian society.', quantity: 3, shelf: 'F5', section: 'Fiction' },
];

const borrowers = [
  { name: 'Ahmed Hassan', email: 'ahmed.hassan@email.com', phoneNumber: '01012345678', address: 'Cairo, Egypt' },
  { name: 'Sara Mohamed', email: 'sara.mohamed@email.com', phoneNumber: '01023456789', address: 'Giza, Egypt' },
  { name: 'Omar Ali', email: 'omar.ali@email.com', phoneNumber: '01034567890', address: 'Alexandria, Egypt' },
  { name: 'Fatima Ibrahim', email: 'fatima.ibrahim@email.com', phoneNumber: '01045678901', address: 'Luxor, Egypt' },
  { name: 'Youssef Mahmoud', email: 'youssef.mahmoud@email.com', phoneNumber: '01056789012', address: 'Aswan, Egypt' },
  { name: 'Nour Ahmed', email: 'nour.ahmed@email.com', phoneNumber: '01067890123', address: 'Mansoura, Egypt' },
  { name: 'Mohamed Khaled', email: 'mohamed.khaled@email.com', phoneNumber: '01078901234', address: 'Tanta, Egypt' },
  { name: 'Layla Samir', email: 'layla.samir@email.com', phoneNumber: '01089012345', address: 'Port Said, Egypt' },
  { name: 'Karim Fathy', email: 'karim.fathy@email.com', phoneNumber: '01090123456', address: 'Suez, Egypt' },
  { name: 'Hana Yasser', email: 'hana.yasser@email.com', phoneNumber: '01101234567', address: 'Ismailia, Egypt' },
  { name: 'Tarek Nabil', email: 'tarek.nabil@email.com', phoneNumber: '01112345678', address: 'Zagazig, Egypt' },
  { name: 'Mariam Adel', email: 'mariam.adel@email.com', phoneNumber: '01123456789', address: 'Damanhur, Egypt' },
  { name: 'Hassan Mostafa', email: 'hassan.mostafa@email.com', phoneNumber: '01134567890', address: 'Beni Suef, Egypt' },
  { name: 'Dina Ashraf', email: 'dina.ashraf@email.com', phoneNumber: '01145678901', address: 'Minya, Egypt' },
  { name: 'Ali Sherif', email: 'ali.sherif@email.com', phoneNumber: '01156789012', address: 'Sohag, Egypt' },
];

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('Taha@bosta', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bosta.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@bosta.com',
      passwordHash,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create books
  console.log('Creating books...');
  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }
  console.log(`Created ${books.length} books`);

  // Create borrowers
  console.log('Creating borrowers...');
  const createdBorrowers: { id: string; email: string }[] = [];
  for (const borrower of borrowers) {
    const created = await prisma.borrower.upsert({
      where: { email: borrower.email },
      update: {},
      create: borrower,
    });
    createdBorrowers.push(created);
  }
  console.log(`Created ${borrowers.length} borrowers`);

  // Create some borrowings
  console.log('Creating borrowings...');
  const allBooks = await prisma.book.findMany();

  // Active borrowings (not returned)
  const activeBorrowings = [
    { borrowerIdx: 0, bookIdx: 0, daysAgo: 5, dueDaysFromNow: 9 },
    { borrowerIdx: 0, bookIdx: 5, daysAgo: 3, dueDaysFromNow: 11 },
    { borrowerIdx: 1, bookIdx: 10, daysAgo: 7, dueDaysFromNow: 7 },
    { borrowerIdx: 2, bookIdx: 15, daysAgo: 2, dueDaysFromNow: 12 },
    { borrowerIdx: 3, bookIdx: 20, daysAgo: 10, dueDaysFromNow: 4 },
    { borrowerIdx: 4, bookIdx: 1, daysAgo: 4, dueDaysFromNow: 10 },
    { borrowerIdx: 5, bookIdx: 6, daysAgo: 6, dueDaysFromNow: 8 },
  ];

  // Overdue borrowings (past due date, not returned)
  const overdueBorrowings = [
    { borrowerIdx: 6, bookIdx: 2, daysAgo: 20, dueDaysAgo: 6 },
    { borrowerIdx: 7, bookIdx: 7, daysAgo: 25, dueDaysAgo: 11 },
    { borrowerIdx: 8, bookIdx: 11, daysAgo: 18, dueDaysAgo: 4 },
    { borrowerIdx: 9, bookIdx: 16, daysAgo: 22, dueDaysAgo: 8 },
    { borrowerIdx: 10, bookIdx: 21, daysAgo: 30, dueDaysAgo: 16 },
  ];

  // Returned borrowings (history)
  const returnedBorrowings = [
    { borrowerIdx: 0, bookIdx: 3, daysAgo: 30, dueDaysAgo: 16, returnedDaysAgo: 18 },
    { borrowerIdx: 1, bookIdx: 8, daysAgo: 25, dueDaysAgo: 11, returnedDaysAgo: 12 },
    { borrowerIdx: 2, bookIdx: 12, daysAgo: 20, dueDaysAgo: 6, returnedDaysAgo: 8 },
    { borrowerIdx: 3, bookIdx: 17, daysAgo: 35, dueDaysAgo: 21, returnedDaysAgo: 22 },
    { borrowerIdx: 4, bookIdx: 22, daysAgo: 40, dueDaysAgo: 26, returnedDaysAgo: 25 },
    { borrowerIdx: 5, bookIdx: 26, daysAgo: 15, dueDaysAgo: 1, returnedDaysAgo: 2 },
    { borrowerIdx: 6, bookIdx: 4, daysAgo: 45, dueDaysAgo: 31, returnedDaysAgo: 30 },
    { borrowerIdx: 7, bookIdx: 9, daysAgo: 50, dueDaysAgo: 36, returnedDaysAgo: 35 },
    { borrowerIdx: 8, bookIdx: 13, daysAgo: 28, dueDaysAgo: 14, returnedDaysAgo: 15 },
    { borrowerIdx: 9, bookIdx: 18, daysAgo: 33, dueDaysAgo: 19, returnedDaysAgo: 20 },
  ];

  const now = new Date();

  // Create active borrowings
  for (const b of activeBorrowings) {
    const borrowedAt = new Date(now.getTime() - b.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(now.getTime() + b.dueDaysFromNow * 24 * 60 * 60 * 1000);

    await prisma.borrowing.create({
      data: {
        borrowerId: createdBorrowers[b.borrowerIdx].id,
        bookId: allBooks[b.bookIdx].id,
        borrowedAt,
        dueDate,
      },
    });
  }
  console.log(`Created ${activeBorrowings.length} active borrowings`);

  // Create overdue borrowings
  for (const b of overdueBorrowings) {
    const borrowedAt = new Date(now.getTime() - b.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(now.getTime() - b.dueDaysAgo * 24 * 60 * 60 * 1000);

    await prisma.borrowing.create({
      data: {
        borrowerId: createdBorrowers[b.borrowerIdx].id,
        bookId: allBooks[b.bookIdx].id,
        borrowedAt,
        dueDate,
      },
    });
  }
  console.log(`Created ${overdueBorrowings.length} overdue borrowings`);

  // Create returned borrowings
  for (const b of returnedBorrowings) {
    const borrowedAt = new Date(now.getTime() - b.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(now.getTime() - b.dueDaysAgo * 24 * 60 * 60 * 1000);
    const returnedAt = new Date(now.getTime() - b.returnedDaysAgo * 24 * 60 * 60 * 1000);

    await prisma.borrowing.create({
      data: {
        borrowerId: createdBorrowers[b.borrowerIdx].id,
        bookId: allBooks[b.bookIdx].id,
        borrowedAt,
        dueDate,
        returnedAt,
      },
    });
  }
  console.log(`Created ${returnedBorrowings.length} returned borrowings`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
