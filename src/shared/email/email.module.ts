import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { readFilesRecursively } from './utility/readfile.utility';
import * as hbs from 'handlebars';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {

        const partialsDir = path.join(__dirname, 'templates');
        const partials = readFilesRecursively(partialsDir);
        partials.forEach(({ name, content }) => {
          hbs.registerPartial(name, content); // Register with Handlebars
        });

        return {
          transport: {
            host: 'smtp.sendgrid.net',
            port: 587, // Use TLS port instead of SSL
            secure: false, // Use TLS instead of SSL
            auth: {
              user: 'apikey',
              pass: configService.get<string>('sendGrid.apiKey'),
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds
            socketTimeout: 10000,     // 10 seconds
            pool: true,               // Use connection pooling
            maxConnections: 5,        // Max connections in pool
            maxMessages: 100,         // Max messages per connection
          },
          defaults: {
            from: configService.get<string>('sendGrid.fromEmail'),
          },
          template: {
            dir: path.join(__dirname, 'templates', 'emails'), // Path to email templates
            adapter: new HandlebarsAdapter(), // Handlebars adapter for templates
            options: {
              strict: true, // Enable strict mode for templates
            },
          }
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule { }
