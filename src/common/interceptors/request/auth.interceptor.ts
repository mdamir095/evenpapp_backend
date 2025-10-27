import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
        intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const request = context.switchToHttp().getRequest();
            if (request.user && request.body) {
                request.body.szCustomerKey = request.user.szCustomerKey;
                request.body.id = request.user.id;
                request.body.szCustomerCode = request.user.szCustomerCode;
                request.body.szEmail = request.user.szEmail;                
            }
            return next.handle().pipe(map((data) => data));
        }
}
