import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Controller('/health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  check() {
    const seconds = new Date().getSeconds();
    
    if (seconds > 30) {
      this.logger.error(`Health check failed. Seconds: ${seconds}`);
      throw new HttpException(
        {
          status: 'error',
          message: 'Service unhealthy',
          timestamp: new Date().toISOString(),
          seconds,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log(`Health check passed. Seconds: ${seconds}`);
    return {
      status: 'ok',
      message: 'Service healthy',
      timestamp: new Date().toISOString(),
      seconds,
    };
  }
}
