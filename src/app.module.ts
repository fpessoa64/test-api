import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { HealthzModule } from './healthz/healthz.module';
import * as fs from 'fs';
import * as path from 'path';
import * as pino from 'pino';

const logFilePath = process.env.LOG_FILE_PATH || path.resolve(process.cwd(), '../logs/test-api.log');

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
        messageKey: 'message',
        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },
        stream: pino.multistream([
          { stream: process.stdout },
          { stream: fs.createWriteStream(logFilePath, { flags: 'a' }) },
        ]),
      },
    }),
    ProductsModule,
    HealthzModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
