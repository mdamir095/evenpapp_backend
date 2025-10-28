import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '@core/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('test-db')
  async testDatabase() {
    try {
      // This will be implemented to test database connection
      return {
        status: 'Database test endpoint ready',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'Database test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
