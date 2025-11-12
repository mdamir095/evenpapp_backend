import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { readFilesRecursively } from './utility/readfile.utility';
import * as hbs from 'handlebars';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Try to find templates in dist folder first (production), then fall back to src (development)
        let partialsDir = path.join(__dirname, 'templates');
        let templatesDir = path.join(__dirname, 'templates', 'emails');
        
        // If templates don't exist in dist, try src folder (for development)
        if (!fs.existsSync(partialsDir)) {
          // Try src folder (for development when running from dist)
          const srcPartialsDir = path.join(process.cwd(), 'src', 'shared', 'email', 'templates');
          if (fs.existsSync(srcPartialsDir)) {
            partialsDir = srcPartialsDir;
            templatesDir = path.join(partialsDir, 'emails');
          } else {
            // If still not found, try relative path from dist
            const relativePath = path.join(process.cwd(), 'dist', 'shared', 'email', 'templates');
            if (fs.existsSync(relativePath)) {
              partialsDir = relativePath;
              templatesDir = path.join(partialsDir, 'emails');
            }
          }
        }

        // Only register partials if directory exists
        if (fs.existsSync(partialsDir)) {
          try {
            const partials = readFilesRecursively(partialsDir);
            partials.forEach(({ name, content }) => {
              hbs.registerPartial(name, content); // Register with Handlebars
            });
            console.log(`Email templates loaded from: ${partialsDir}`);
          } catch (error) {
            console.warn(`Warning: Could not load email templates from ${partialsDir}:`, error.message);
          }
        } else {
          console.warn(`Warning: Email templates directory not found at: ${partialsDir}`);
        }

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
            dir: templatesDir, // Path to email templates
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
