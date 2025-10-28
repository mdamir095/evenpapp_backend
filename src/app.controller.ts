import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '@core/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    @InjectRepository(User, 'mongo')
    private readonly userRepository: MongoRepository<User>
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
      console.log('Testing database connection...');
      
      // Test database connection by counting users
      const userCount = await this.userRepository.count();
      console.log(`Database connection successful. User count: ${userCount}`);
      
      // Test finding a specific user
      const testUser = await this.userRepository.findOne({ 
        where: { email: 'shiv@whiz-solutions.com' } 
      });
      
      return {
        status: 'Database connection successful',
        userCount: userCount,
        testUserFound: !!testUser,
        testUserEmail: testUser?.email || 'Not found',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Database test failed:', error);
      return {
        status: 'Database test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
