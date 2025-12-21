import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ErrorSimulatorService } from './services/error-simulator.service';
import { ErrorSimulationType } from './enums/error-simulation-type.enum';

const mockProductRepository = {
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockErrorSimulator = {
  simulateError: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: 'IProductRepository',
          useValue: mockProductRepository,
        },
        {
          provide: ErrorSimulatorService,
          useValue: mockErrorSimulator,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = [{ id: 1, name: 'Test Product' }];
      mockProductRepository.findAll.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const result = { id: 1, name: 'Test Product' };
      mockProductRepository.findById.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      const dto = { name: 'New Product', description: 'Desc', price: 10 };
      const result = { id: 1, ...dto };
      mockProductRepository.create.mockResolvedValue(result);

      expect(await service.create(dto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update and return a product', async () => {
      const dto = { name: 'Updated Product' };
      const result = { id: 1, name: 'Updated Product' };
      mockProductRepository.update.mockResolvedValue(result);

      expect(await service.update(1, dto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockProductRepository.delete.mockResolvedValue(undefined);
      await service.remove(1);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated products with correct metadata', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Product 1',
          description: 'Desc 1',
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Product 2',
          description: 'Desc 2',
          price: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockResult = {
        products: mockProducts,
        total: 25,
      };
      mockProductRepository.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAllPaginated(2, 10);

      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should return first page with correct metadata', async () => {
      const mockProducts = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          description: `Desc ${i + 1}`,
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      const mockResult = {
        products: mockProducts,
        total: 25,
      };
      mockProductRepository.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAllPaginated(1, 10);

      expect(result.data).toHaveLength(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should return last page with correct metadata', async () => {
      const mockProducts = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: i + 21,
          name: `Product ${i + 21}`,
          description: `Desc ${i + 21}`,
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      const mockResult = {
        products: mockProducts,
        total: 25,
      };
      mockProductRepository.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAllPaginated(3, 10);

      expect(result.data).toHaveLength(5);
      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should handle empty results', async () => {
      const mockResult = {
        products: [],
        total: 0,
      };
      mockProductRepository.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAllPaginated(1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('Error Simulation', () => {
    describe('findOne with error simulation', () => {
      it('should call errorSimulator with correct context', async () => {
        const product = {
          id: 1,
          name: 'Test',
          description: 'Desc',
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockProductRepository.findById.mockResolvedValue(product);
        mockErrorSimulator.simulateError.mockImplementation(() => {});

        await service.findOne(1, ErrorSimulationType.DB_ERROR);

        expect(mockErrorSimulator.simulateError).toHaveBeenCalledWith(
          ErrorSimulationType.DB_ERROR,
          {
            operation: 'findOne',
            productId: 1,
          },
        );
      });

      it('should throw error if simulator throws', async () => {
        mockErrorSimulator.simulateError.mockImplementation(() => {
          throw new InternalServerErrorException('Simulated error');
        });

        await expect(
          service.findOne(1, ErrorSimulationType.DB_ERROR),
        ).rejects.toThrow(InternalServerErrorException);
      });
    });

    describe('create with error simulation', () => {
      it('should call errorSimulator before creating product', async () => {
        const dto = { name: 'New', description: 'Desc', price: 10 };
        mockProductRepository.create.mockResolvedValue({
          id: 1,
          ...dto,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockErrorSimulator.simulateError.mockImplementation(() => {});

        await service.create(dto, ErrorSimulationType.VALIDATION_ERROR);

        expect(mockErrorSimulator.simulateError).toHaveBeenCalledWith(
          ErrorSimulationType.VALIDATION_ERROR,
          {
            operation: 'create',
            metadata: { dto },
          },
        );
      });
    });

    describe('findAllPaginated with error simulation', () => {
      it('should call errorSimulator with pagination context', async () => {
        const mockResult = { products: [], total: 0 };
        mockProductRepository.findAllPaginated.mockResolvedValue(mockResult);
        mockErrorSimulator.simulateError.mockImplementation(() => {});

        await service.findAllPaginated(
          1,
          10,
          ErrorSimulationType.OVERLOAD_ERROR,
        );

        expect(mockErrorSimulator.simulateError).toHaveBeenCalledWith(
          ErrorSimulationType.OVERLOAD_ERROR,
          {
            operation: 'findAllPaginated',
            metadata: { page: 1, pageSize: 10 },
          },
        );
      });
    });
  });
});
