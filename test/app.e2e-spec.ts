import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/api/products (GET) with pagination', () => {
    beforeEach(async () => {
      // Create some test products
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Product 1', description: 'Desc 1', price: 10 });
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Product 2', description: 'Desc 2', price: 20 });
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Product 3', description: 'Desc 3', price: 30 });
    });

    it('should return paginated products with default values', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.pageSize).toBe(10);
          expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    it('should return paginated products with custom page and pageSize', () => {
      return request(app.getHttpServer())
        .get('/api/products?page=1&pageSize=2')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.pageSize).toBe(2);
          expect(res.body.data.length).toBeLessThanOrEqual(2);
        });
    });

    it('should validate page >= 1', () => {
      return request(app.getHttpServer())
        .get('/api/products?page=0')
        .expect(400);
    });

    it('should validate page is a positive number', () => {
      return request(app.getHttpServer())
        .get('/api/products?page=-1')
        .expect(400);
    });

    it('should validate pageSize >= 1', () => {
      return request(app.getHttpServer())
        .get('/api/products?pageSize=0')
        .expect(400);
    });

    it('should validate pageSize <= 100', () => {
      return request(app.getHttpServer())
        .get('/api/products?pageSize=150')
        .expect(400);
    });

    it('should return correct pagination metadata', () => {
      return request(app.getHttpServer())
        .get('/api/products?page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty('totalItems');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('hasNextPage');
          expect(res.body.meta).toHaveProperty('hasPreviousPage');
          expect(res.body.meta.hasPreviousPage).toBe(false);
        });
    });
  });

  describe('Error Simulation (e2e)', () => {
    describe('GET /api/products with error simulation', () => {
      it('should return 500 with db_error simulation', () => {
        return request(app.getHttpServer())
          .get('/api/products?simulateError=db_error')
          .expect(500)
          .expect((res) => {
            expect(res.body.message).toBe('Falha no repositório');
            expect(res.body.details.simulated).toBe(true);
            expect(res.body.details.operation).toBe('findAllPaginated');
          });
      });

      it('should return 400 with validation_error simulation', () => {
        return request(app.getHttpServer())
          .get('/api/products?simulateError=validation_error')
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBe('Dados corrompidos');
            expect(res.body.details.simulated).toBe(true);
          });
      });

      it('should return 503 with overload_error simulation', () => {
        return request(app.getHttpServer())
          .get('/api/products?simulateError=overload_error')
          .expect(503)
          .expect((res) => {
            expect(res.body.message).toBe('Sobrecarga do serviço');
            expect(res.body.details.simulated).toBe(true);
          });
      });

      it('should return 400 with invalid error type', () => {
        return request(app.getHttpServer())
          .get('/api/products?simulateError=invalid_type')
          .expect(400);
      });
    });

    describe('GET /api/products/:id with error simulation', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/products')
          .send({ name: 'Product 1', description: 'Desc 1', price: 10 });
      });

      it('should return 500 with db_error simulation', () => {
        return request(app.getHttpServer())
          .get('/api/products/1?simulateError=db_error')
          .expect(500)
          .expect((res) => {
            expect(res.body.details.operation).toBe('findOne');
            expect(res.body.details.productId).toBe(1);
          });
      });
    });

    describe('POST /api/products with error simulation', () => {
      it('should return 500 with db_error simulation', () => {
        return request(app.getHttpServer())
          .post('/api/products?simulateError=db_error')
          .send({ name: 'Test', description: 'Desc', price: 10 })
          .expect(500);
      });
    });

    describe('PATCH /api/products/:id with error simulation', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/products')
          .send({ name: 'Product 1', description: 'Desc 1', price: 10 });
      });

      it('should return 503 with overload_error simulation', () => {
        return request(app.getHttpServer())
          .patch('/api/products/1?simulateError=overload_error')
          .send({ name: 'Updated' })
          .expect(503);
      });
    });

    describe('DELETE /api/products/:id with error simulation', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/products')
          .send({ name: 'Product 1', description: 'Desc 1', price: 10 });
      });

      it('should return 400 with validation_error simulation', () => {
        return request(app.getHttpServer())
          .delete('/api/products/1?simulateError=validation_error')
          .expect(400);
      });
    });
  });
});
