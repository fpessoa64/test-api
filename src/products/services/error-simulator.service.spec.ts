import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ErrorSimulatorService } from './error-simulator.service';
import { ErrorSimulationType } from '../enums/error-simulation-type.enum';

describe('ErrorSimulatorService', () => {
  let service: ErrorSimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorSimulatorService],
    }).compile();

    service = module.get<ErrorSimulatorService>(ErrorSimulatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not throw when errorType is undefined', () => {
    expect(() => {
      service.simulateError(undefined, { operation: 'test' });
    }).not.toThrow();
  });

  describe('DB_ERROR simulation', () => {
    it('should throw InternalServerErrorException with correct details', () => {
      expect(() => {
        service.simulateError(ErrorSimulationType.DB_ERROR, {
          operation: 'findOne',
          productId: 1,
        });
      }).toThrow(InternalServerErrorException);
    });

    it('should include simulated flag and context in error', () => {
      try {
        service.simulateError(ErrorSimulationType.DB_ERROR, {
          operation: 'findOne',
          productId: 123,
          metadata: { custom: 'data' },
        });
      } catch (error: any) {
        expect(error.response.details.simulated).toBe(true);
        expect(error.response.details.productId).toBe(123);
        expect(error.response.details.operation).toBe('findOne');
        expect(error.response.details.custom).toBe('data');
      }
    });
  });

  describe('VALIDATION_ERROR simulation', () => {
    it('should throw BadRequestException', () => {
      expect(() => {
        service.simulateError(ErrorSimulationType.VALIDATION_ERROR, {
          operation: 'create',
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('OVERLOAD_ERROR simulation', () => {
    it('should throw ServiceUnavailableException', () => {
      expect(() => {
        service.simulateError(ErrorSimulationType.OVERLOAD_ERROR, {
          operation: 'findAll',
        });
      }).toThrow(ServiceUnavailableException);
    });
  });
});
