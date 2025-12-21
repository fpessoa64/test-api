export enum ErrorSimulationType {
  DB_ERROR = 'db_error',
  VALIDATION_ERROR = 'validation_error',
  OVERLOAD_ERROR = 'overload_error',
}

export const ERROR_SIMULATION_CONFIG = {
  [ErrorSimulationType.DB_ERROR]: {
    statusCode: 500,
    message: 'Falha no repositório',
    description: 'Simulação de erro crítico no repositório de dados',
  },
  [ErrorSimulationType.VALIDATION_ERROR]: {
    statusCode: 400,
    message: 'Dados corrompidos',
    description: 'Simulação de dados inválidos ou corrompidos',
  },
  [ErrorSimulationType.OVERLOAD_ERROR]: {
    statusCode: 503,
    message: 'Sobrecarga do serviço',
    description: 'Simulação de sobrecarga ou indisponibilidade temporária',
  },
} as const;
