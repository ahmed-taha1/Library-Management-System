import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../../prisma';
import { BookNotFoundException, BookIsbnExistsException } from '../../common/exceptions';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: PrismaService;

  const mockBook = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'A handbook of agile software craftsmanship',
    quantity: 5,
    shelf: 'C1',
    section: 'Technology',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    book: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookDto = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      description: 'A handbook of agile software craftsmanship',
      quantity: 5,
      shelf: 'C1',
      section: 'Technology',
    };

    it('should create a book successfully', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(result).toEqual(mockBook);
      expect(prisma.book.findUnique).toHaveBeenCalledWith({
        where: { isbn: createBookDto.isbn },
      });
      expect(prisma.book.create).toHaveBeenCalledWith({ data: createBookDto });
    });

    it('should throw BookIsbnExistsException if ISBN already exists', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);

      await expect(service.create(createBookDto)).rejects.toThrow(BookIsbnExistsException);
      expect(prisma.book.create).not.toHaveBeenCalled();
    });

    it('should create a book with quantity 0', async () => {
      const dtoWithZeroQuantity = { ...createBookDto, quantity: 0 };
      const bookWithZeroQuantity = { ...mockBook, quantity: 0 };
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue(bookWithZeroQuantity);

      const result = await service.create(dtoWithZeroQuantity);

      expect(result.quantity).toBe(0);
    });

    it('should create a book without optional description', async () => {
      const { description, ...dtoWithoutDesc } = createBookDto;
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue({ ...mockBook, description: null });

      const result = await service.create(dtoWithoutDesc as any);

      expect(result.description).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const books = [mockBook];
      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: books,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(25);

      const result = await service.findAll(3, 10);

      expect(result.meta).toEqual({
        total: 25,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no books exist', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should use default values when not provided', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      await service.findAll();

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);

      const result = await service.findOne(mockBook.id);

      expect(result).toEqual(mockBook);
      expect(prisma.book.findUnique).toHaveBeenCalledWith({
        where: { id: mockBook.id },
      });
    });

    it('should throw BookNotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(BookNotFoundException);
    });
  });

  describe('search', () => {
    it('should search books by query', async () => {
      const books = [mockBook];
      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.search('Clean', 1, 10);

      expect(result.data).toEqual(books);
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Clean', mode: 'insensitive' } },
            { author: { contains: 'Clean', mode: 'insensitive' } },
            { isbn: { contains: 'Clean', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty results for no matches', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      const result = await service.search('NonExistent', 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should search by ISBN', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.search('9780132350884', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { isbn: { contains: '9780132350884', mode: 'insensitive' } },
            ]),
          },
        }),
      );
    });

    it('should search by author name', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.search('Robert', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].author).toContain('Robert');
    });

    it('should handle empty search query', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.search('', 1, 10);

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: '', mode: 'insensitive' } },
              { author: { contains: '', mode: 'insensitive' } },
              { isbn: { contains: '', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });
  });

  describe('update', () => {
    const updateBookDto = { title: 'Clean Code (2nd Edition)' };

    it('should update a book successfully', async () => {
      const updatedBook = { ...mockBook, ...updateBookDto };
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.update.mockResolvedValue(updatedBook);

      const result = await service.update(mockBook.id, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: mockBook.id },
        data: updateBookDto,
      });
    });

    it('should throw BookNotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateBookDto)).rejects.toThrow(BookNotFoundException);
      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('should throw BookIsbnExistsException if updating to existing ISBN', async () => {
      const anotherBook = { ...mockBook, id: 'different-id' };
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.findFirst.mockResolvedValue(anotherBook);

      await expect(service.update(mockBook.id, { isbn: '1234567890' })).rejects.toThrow(BookIsbnExistsException);
      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('should allow updating ISBN to same value', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.findFirst.mockResolvedValue(null);
      mockPrismaService.book.update.mockResolvedValue(mockBook);

      const result = await service.update(mockBook.id, { isbn: mockBook.isbn });

      expect(result).toEqual(mockBook);
      expect(prisma.book.update).toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      const multiFieldUpdate = { title: 'New Title', author: 'New Author', quantity: 10 };
      const updatedBook = { ...mockBook, ...multiFieldUpdate };
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.update.mockResolvedValue(updatedBook);

      const result = await service.update(mockBook.id, multiFieldUpdate);

      expect(result.title).toBe('New Title');
      expect(result.author).toBe('New Author');
      expect(result.quantity).toBe(10);
    });

    it('should update quantity to 0', async () => {
      const updatedBook = { ...mockBook, quantity: 0 };
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.update.mockResolvedValue(updatedBook);

      const result = await service.update(mockBook.id, { quantity: 0 });

      expect(result.quantity).toBe(0);
    });
  });

  describe('remove', () => {
    it('should delete a book successfully', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.delete.mockResolvedValue(mockBook);

      const result = await service.remove(mockBook.id);

      expect(result).toEqual(mockBook);
      expect(prisma.book.delete).toHaveBeenCalledWith({
        where: { id: mockBook.id },
      });
    });

    it('should throw BookNotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(BookNotFoundException);
      expect(prisma.book.delete).not.toHaveBeenCalled();
    });
  });
});
