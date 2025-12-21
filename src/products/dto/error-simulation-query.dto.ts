import { IsOptional, IsEnum } from 'class-validator';
import { ErrorSimulationType } from '../enums/error-simulation-type.enum';

export class ErrorSimulationQueryDto {
  @IsOptional()
  @IsEnum(ErrorSimulationType, {
    message:
      'simulateError must be one of: db_error, validation_error, overload_error',
  })
  simulateError?: ErrorSimulationType;
}
