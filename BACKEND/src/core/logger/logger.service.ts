import { RequestContext } from '@core/request-context/request-context.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('ApplicationLogger');
  private requestLogs: Map<string, string[]> = new Map();

  constructor(private readonly requestContext: RequestContext) {}
   
  log(message: string) {
    const requestId = this.requestContext.get('requestId') || 'unknown';
    const logs = this.requestLogs.get(requestId) || [];
    logs.push(message);
    this.requestLogs.set(requestId, logs);
    this.logger.log(`[${requestId}] ${message}`);
  }

  info(message: string) {
    this.logger.log(`${message}`);
  }
  
  error(message: string, trace?: string) {
    const requestId = this.requestContext.get('requestId') || 'unknown';
    const logs = this.requestLogs.get(requestId) || [];
    logs.push(message);
    this.requestLogs.set(requestId, logs);
    this.logger.error(`[${requestId}] ${message}`, trace);
  }

  getLogsStep() {
    const requestId = this.requestContext.get('requestId') || 'unknown';
    const logs = this.requestLogs.get(requestId) || [];
    return logs;
  }

  clearLogs() {
    const requestId = this.requestContext.get('requestId');
    if (requestId) {
      this.requestContext.clear();
      this.requestLogs.delete(requestId);
      this.logger.log(`[${requestId}] Logs cleared`);
    }
  }
}
