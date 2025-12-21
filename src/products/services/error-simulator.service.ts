import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ErrorSimulationType,
  ERROR_SIMULATION_CONFIG,
} from '../enums/error-simulation-type.enum';

export interface ErrorContext {
  operation: string;
  productId?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class ErrorSimulatorService {
  private readonly logger = new Logger(ErrorSimulatorService.name);

  simulateError(
    errorType: ErrorSimulationType | undefined,
    context: ErrorContext,
  ): void {
    if (!errorType) {
      return;
    }

    const config = ERROR_SIMULATION_CONFIG[errorType];
    const errorDetails = {
      errorType,
      operation: context.operation,
      productId: context.productId,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    this.logger.error(
      `SIMULATED ERROR: ${config.description}`,
      JSON.stringify(errorDetails),
    );

    const response = {
      message: config.message,
      details: {
        ...errorDetails,
        simulated: true,
      },
    };

    switch (errorType) {
      case ErrorSimulationType.DB_ERROR:
        throw new InternalServerErrorException(response);
      case ErrorSimulationType.VALIDATION_ERROR:
        throw new BadRequestException(response);
      case ErrorSimulationType.OVERLOAD_ERROR:
        throw new ServiceUnavailableException(response);
    }
  }
}
