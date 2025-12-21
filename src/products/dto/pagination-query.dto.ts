import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Max, IsEnum } from 'class-validator';
import { ErrorSimulationType } from '../enums/error-simulation-type.enum';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(ErrorSimulationType, {
    message:
      'simulateError must be one of: db_error, validation_error, overload_error',
  })
  simulateError?: ErrorSimulationType;
}
