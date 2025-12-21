import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ErrorSimulatorService } from './services/error-simulator.service';
import { InMemoryProductRepository } from './repositories/in-memory-product.repository';

@Module({
  controllers: [ProductsController],
  providers: [  ProductsService,
    ErrorSimulatorService,
    {
      provide: 'IProductRepository',
      useClass: InMemoryProductRepository,
    },],
  
})
export class ProductsModule {}
