// request-context.middleware.ts
import { RequestContext } from '@core/request-context/request-context.service';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContext
  ) {}

  use(req: any, res: any, next: () => void) {
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    this.requestContext.run(new Map([['requestId', requestId]]),next);
  }
}
