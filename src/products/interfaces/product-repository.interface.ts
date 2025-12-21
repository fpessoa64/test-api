import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findAllPaginated(page: number, pageSize: number): Promise<{
    products: Product[];
    total: number;
  }>;
  findById(id: number): Promise<Product | null>;
  create(createProductDto: CreateProductDto): Promise<Product>;
  update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
  delete(id: number): Promise<void>;
}
