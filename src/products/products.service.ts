import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from './dto/paginated-response.dto';
import { Product } from './entities/product.entity';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { ErrorSimulatorService } from './services/error-simulator.service';
import { ErrorSimulationType } from './enums/error-simulation-type.enum';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly errorSimulator: ErrorSimulatorService,
  ) {}

  create(createProductDto: CreateProductDto, simulateError?: ErrorSimulationType) {
    this.errorSimulator.simulateError(simulateError, {
      operation: 'create',
      metadata: { dto: createProductDto },
    });

    this.logger.log(`Creating product: ${createProductDto.name}`);
  
    return this.productRepository.create(createProductDto);
  }

  findAll() {
    return this.productRepository.findAll();
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
    simulateError?: ErrorSimulationType,
  ): Promise<PaginatedResponseDto<Product>> {
    

    this.errorSimulator.simulateError(simulateError, {
      operation: 'findAllPaginated',
      metadata: { page, pageSize },
    });

   
    const { products, total } =
      await this.productRepository.findAllPaginated(page, pageSize);

    const totalPages = Math.ceil(total / pageSize);

    const meta: PaginationMetaDto = {
      page,
      pageSize,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    this.logger.log(
      `Retrieved ${products.length} products (page ${page}/${totalPages})`,
    );

    return new PaginatedResponseDto(products, meta);
  }

  async findOne(id: number, simulateError?: ErrorSimulationType) {
    this.errorSimulator.simulateError(simulateError, {
      operation: 'findOne',
      productId: id,
    });

    const product = await this.productRepository.findById(id);
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(`Retrieved product with ID ${id}`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto, simulateError?: ErrorSimulationType) {
    this.errorSimulator.simulateError(simulateError, {
      operation: 'update',
      productId: id,
      metadata: { dto: updateProductDto },
    });

    this.logger.log(`Updating product with ID ${id}`);
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: number, simulateError?: ErrorSimulationType) {
    this.errorSimulator.simulateError(simulateError, {
      operation: 'remove',
      productId: id,
    });

    this.logger.log(`Deleting product with ID ${id}`);
    return this.productRepository.delete(id);
  }
}
