import { Controller, Get, Logger} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    try {
     
      return this.appService.getHello();
    } catch (error) {
      //console.error('Error in getHello:', error);
      this.logger.error(error);
      throw error;
    }
  }
}
