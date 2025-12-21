import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { IProductRepository } from '../interfaces/product-repository.interface';

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private products: Product[] = [];
  private currentId = 1;

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
  ): Promise<{
    products: Product[];
    total: number;
  }> {
    // Ordenar por createdAt DESC (mais recentes primeiro)
    const sortedProducts = [...this.products].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Calcular offset
    const offset = (page - 1) * pageSize;

    // Paginar
    const paginatedProducts = sortedProducts.slice(offset, offset + pageSize);

    return {
      products: paginatedProducts,
      total: this.products.length,
    };
  }

  async findById(id: number): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new Product({
      id: this.currentId++,
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.products.push(newProduct);
    return newProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = new Product({
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    });

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  async delete(id: number): Promise<void> {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.products.splice(productIndex, 1);
  }
}
