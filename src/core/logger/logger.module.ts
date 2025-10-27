// logger.module.ts
import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RequestContextModule } from '@core/request-context/request-context.module';

@Global()
@Module({
  imports:[RequestContextModule],
  providers: [LoggerService],
  exports: [LoggerService,RequestContextModule],
})
export class LoggerModule {}
