import { LoggerService } from '@core/logger/logger.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    constructor(private readonly loggerService: LoggerService) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      return next.handle().pipe(
        map((data) => {
          this.loggerService.clearLogs();
          this.loggerService.info(`Request to ${request.url} completed`);
          return {
          status:"OK",
          data
          }
        }),
      );
    }
  }
  