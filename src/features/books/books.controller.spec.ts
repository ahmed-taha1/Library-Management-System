import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

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

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCacheManager = {
    reset: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: mockBooksService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      description: 'A handbook of agile software craftsmanship',
      quantity: 5,
      shelf: 'C1',
      section: 'Technology',
    };

    it('should create a book and invalidate cache', async () => {
      mockBooksService.create.mockResolvedValue(mockBook);

      const result = await controller.create(createBookDto);

      expect(result).toEqual(mockBook);
      expect(service.create).toHaveBeenCalledWith(createBookDto);
      expect(mockCacheManager.reset).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated books with default pagination', async () => {
      const paginatedResult = {
        data: [mockBook],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockBooksService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should return paginated books with custom pagination', async () => {
      const paginatedResult = {
        data: [mockBook],
        meta: { total: 25, page: 2, limit: 5, totalPages: 5 },
      };
      mockBooksService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('2', '5');

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('search', () => {
    it('should search books by query', async () => {
      const searchResult = {
        data: [mockBook],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockBooksService.search.mockResolvedValue(searchResult);

      const result = await controller.search('Clean');

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith('Clean', 1, 10);
    });

    it('should handle empty search query', async () => {
      const searchResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockBooksService.search.mockResolvedValue(searchResult);

      const result = await controller.search('');

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith('', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockBooksService.findOne.mockResolvedValue(mockBook);

      const result = await controller.findOne(mockBook.id);

      expect(result).toEqual(mockBook);
      expect(service.findOne).toHaveBeenCalledWith(mockBook.id);
    });
  });

  describe('update', () => {
    const updateBookDto = { title: 'Clean Code (2nd Edition)' };

    it('should update a book and invalidate cache', async () => {
      const updatedBook = { ...mockBook, ...updateBookDto };
      mockBooksService.update.mockResolvedValue(updatedBook);

      const result = await controller.update(mockBook.id, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(service.update).toHaveBeenCalledWith(mockBook.id, updateBookDto);
      expect(mockCacheManager.reset).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a book and invalidate cache', async () => {
      mockBooksService.remove.mockResolvedValue(mockBook);

      const result = await controller.remove(mockBook.id);

      expect(result).toEqual(mockBook);
      expect(service.remove).toHaveBeenCalledWith(mockBook.id);
      expect(mockCacheManager.reset).toHaveBeenCalled();
    });
  });
});
