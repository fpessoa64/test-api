import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    this.logger.log('getHello');
    throw new Error('getHello error');
    return 'Hello World!';
  }
}
