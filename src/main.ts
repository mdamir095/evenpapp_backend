import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@common/exceptions/exceptions';
import { LoggerService } from '@core/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EmailService } from '@shared/email/email.service';
import { ResponseInterceptor } from '@common/interceptors/response/response.interceptor';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Note: Multer configuration is handled by FileInterceptor in controllers

  app.useGlobalPipes(new ValidationPipe({
    validationError: {
      target: false,
      value: false,
    },
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true
  }));

  const config = app.get<ConfigService>(ConfigService);
  const loggerService = app.get<LoggerService>(LoggerService);
  const emailService = app.get<EmailService>(EmailService);


  var apiPrefix = config.get('server.prefix');
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: function (origin, callback) {
      var whitelist = config.get<Array<string>>('cors');
      console.log('CORS check - Origin:', origin, 'Whitelist:', whitelist);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('CORS: Allowing request with no origin');
        return callback(null, true);
      }
      
      // Check if origin is in whitelist (exact match or ends with)
      const isAllowed = whitelist?.some((allowedOrigin) => {
        return origin === allowedOrigin || origin.endsWith(allowedOrigin);
      });
      
      if (isAllowed) {
        console.log('CORS: Allowing origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS: Blocking origin:', origin);
        callback(new Error(`Not allowed by CORS ${origin}`));
      }
    },
    "credentials": true
  });

  app.useGlobalFilters(new AllExceptionsFilter(loggerService, emailService, config));


  // Use the ResponseInterceptor globally
  app.useGlobalInterceptors(new ResponseInterceptor(loggerService));

  // swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI CRM API')
    .setDescription('AI CRM API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerDocsPath = `${apiPrefix}/docs`;


  SwaggerModule.setup(swaggerDocsPath, app, document);

  const port = process.env.PORT || config.get('server.port') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
