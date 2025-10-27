import { LoggerService } from '@core/logger/logger.service';
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@shared/email/email.service';
import { Response } from 'express';

@Catch() // Catch all exceptions
export class AllExceptionsFilter implements ExceptionFilter {

  constructor(
    private readonly loggerService: LoggerService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) { }


  catch(exception: unknown, host: ArgumentsHost) {

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500; // Default to 500 if not an instance of HttpException

    // Log the error
    this.loggerService.error(
      `HTTP Status: ${status} Error Message: ${exception instanceof Error ? exception.message : 'Unknown error'
      }`,
    );

    let responseMessage: any = {
      statusCode: status,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
      path: request.url,
    };

    // Handle validation errors (BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse: any = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        responseMessage = {
          statusCode: status,
          message: exceptionResponse['message'] || exception.message,
          error: exceptionResponse['error'] || 'Bad Request',
          path: request.url,
        };
      }
    } else if (exception instanceof HttpException) {
      // Handle general HttpExceptions
      const exceptionResponse: any = exception.getResponse();

      responseMessage = {
        statusCode: status,
        message: exceptionResponse['message'] || exception.message,
        error: exceptionResponse['error'] || 'Bad Request',
        path: request.url,
      };
    }


    // send exception email from here
    this.sendexceptionEmail(responseMessage, request);

    // Send the custom response
    response.status(status).json(responseMessage);

  }

  async sendexceptionEmail(responseMessage: any, request: any) {
    try {
      // const steps = { ...this.loggerService.getLogsStep() };
      // const emailData = {
      //   subject: 'Urgent Exception!',
      //   to: this.configService.get("email.exceptionEmail"),
      //   template: 'exceptions/exception',
      //   context: { steps, error: responseMessage.error }, // Pass dynamic context
      // };
      // await this.emailService.sendEmail({
      //   to: emailData.to,
      //   subject: emailData.subject,
      //   template: emailData.template,
      //   context: emailData.context,
      // });
      // this.loggerService.clearLogs();
      // this.loggerService.info(`Request to ${request.url} completed and getting error: ${responseMessage.error}`);
    } catch (error) {
      this.loggerService.error(`failed to send exception email for api ${request.url} and getting error: ${error} process completed`);
    }
  }
}
