import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ErrorSimulationQueryDto } from './dto/error-simulation-query.dto';

@Controller('/api/products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Query() query: ErrorSimulationQueryDto,
  ) {
    this.logger.log(
      `POST /api/products - simulateError: ${query.simulateError || 'none'}`,
    );
   
    return this.productsService.create(createProductDto, query.simulateError);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    const { page = 1, pageSize = 10, simulateError } = paginationQuery;
    this.logger.log(
      `GET /api/products - page: ${page}, pageSize: ${pageSize}, simulateError: ${simulateError || 'none'}`,
    );
    return this.productsService.findAllPaginated(page, pageSize, simulateError);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: ErrorSimulationQueryDto) {
    this.logger.log(
      `GET /api/products/${id} - simulateError: ${query.simulateError || 'none'}`,
    );
    return this.productsService.findOne(+id, query.simulateError);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Query() query: ErrorSimulationQueryDto,
  ) {
    this.logger.log(
      `PATCH /api/products/${id} - simulateError: ${query.simulateError || 'none'}`,
    );
    return this.productsService.update(+id, updateProductDto, query.simulateError);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query: ErrorSimulationQueryDto) {
    this.logger.log(
      `DELETE /api/products/${id} - simulateError: ${query.simulateError || 'none'}`,
    );
    return this.productsService.remove(+id, query.simulateError);
  }
}
