import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SupabaseModule } from '@shared/modules/supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '@core/config/configuration';
import { RequestContextMiddleware } from '@common/middlewares/request-context/request-context.middleware';
import { LoggerModule } from '@core/logger/logger.module'; 
import { EmailModule } from '@shared/email/email.module';
import { HandlebarsService } from '@common/helper/handlebar';
import { PdfModule } from '@shared/modules/pdf/pdf.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer'; 
import { EventModule } from '@modules/event/event.module';
import { AdminModule } from '@modules/admin/admin.module';
import { FeatureModule } from './modules/feature/feature.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '@modules/role/role.module';
import { FieldModule } from '@modules/field/field.module';
import { FormModule } from '@modules/form/form.module';
import { ServiceCategoryModule } from '@modules/service-category/service-category.module';
import { VenueModule } from '@modules/venue/venue.module';
import { VendorModule } from '@modules/vendor/vendor.module';
import { EnterpriseModule } from '@modules/enterprise/enterprise.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { VenueCategoryModule } from '@modules/venue-category/venue-category.module';
import { ContentPolicyModule } from '@modules/content-policy/content-policy.module';
import { VenueBookingModule } from '@modules/venue-booking/venue-booking.module';
import { BookingModule } from '@modules/booking/booking.module';
import { VendorCategoryModule } from '@modules/vendor-category/vendor-category.module';
import { FaqModule } from '@modules/faq/faq.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { OfferModule } from '@modules/offer/offer.module';
import { FeedbackModule } from '@modules/feedback/feedback.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { LocationModule } from '@modules/location/location.module';
import { BannerModule } from '@modules/banner/banner.module';
import { TestimonialModule } from '@modules/testimonial/testimonial.module';
import { RatingModule } from './modules/rating/rating.module';
import { QuotationRequestModule } from './modules/quotation-request/quotation-request.module';
import { MealTypeModule } from './modules/meal-type/meal-type.module';
import { CuisineModule } from './modules/cuisine/cuisine.module';
import { ServingStyleModule } from './modules/serving-style/serving-style.module';
import { AdditionalServiceModule } from './modules/additional-service/additional-service.module';
import { SimilarModule } from './modules/similar/similar.module';
import { ChatModule } from './modules/chat/chat.module';
import { ServiceCategoryFormInputsModule } from './modules/service-category-form-inputs/service-category-form-inputs.module';

@Module({
  imports: [
        MailerModule.forRootAsync({
      imports: [
        ConfigModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'uploads', 'profile'), // <- serve from this folder
          serveRoot: '/uploads/profile',   // <- serve from this route
        }),
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'uploads', 'quotation'), // <- serve from this folder
          serveRoot: '/uploads/quotation',   // <- serve from this route
        }),
      ],
      useFactory: async (configService: ConfigService) => {
        // Use SendGrid for production, Gmail SMTP as fallback
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (isProduction) {
          // Try SendGrid first, fallback to Gmail SMTP
          const sendGridApiKey = configService.get<string>('sendGrid.apiKey');
          
          if (sendGridApiKey && sendGridApiKey.length > 10) {
            console.log('Using SendGrid for email service');
            return {
              transport: {
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false, // Use TLS
                auth: {
                  user: 'apikey',
                  pass: sendGridApiKey,
                },
                connectionTimeout: 15000, // 15 seconds
                greetingTimeout: 15000,   // 15 seconds
                socketTimeout: 15000,     // 15 seconds
                pool: true,
                maxConnections: 3,
                maxMessages: 50,
              },
              defaults: {
                from: configService.get<string>('sendGrid.fromEmail'),
              },
            };
          } else {
            console.log('SendGrid API key not found, using Gmail SMTP fallback');
            // Fallback to Gmail SMTP
            return {
              transport: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: configService.get('email.SMTP_USER'),
                  pass: configService.get('email.SMTP_PASS'),
                },
                connectionTimeout: 20000, // 20 seconds
                greetingTimeout: 20000,   // 20 seconds
                socketTimeout: 20000,     // 20 seconds
                pool: true,
                maxConnections: 3,
                maxMessages: 50,
              },
              defaults: {
                from: `"No Reply" <${configService.get('email.SMTP_FROM')}>`,
              },
            };
          }
        } else {
          // Use Gmail SMTP for development with better timeout settings
          return {
            transport: {
              host: configService.get('email.SMTP_HOST'),
              port: parseInt(configService.get('email.SMTP_PORT') || '587'),
              secure: configService.get('email.SMTP_SECURE') === 'true',
              auth: {
                user: configService.get('email.SMTP_USER'),
                pass: configService.get('email.SMTP_PASS'),
              },
              connectionTimeout: 15000, // 15 seconds
              greetingTimeout: 15000,   // 15 seconds
              socketTimeout: 15000,     // 15 seconds
              pool: true,               // Use connection pooling
              maxConnections: 5,        // Max connections in pool
              maxMessages: 100,         // Max messages per connection
            },
            defaults: {
              from: `"No Reply" <${configService.get('email.SMTP_FROM')}>`,
            },
          };
        }
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'mongo',
      useFactory: (config: ConfigService) => {
          // For Railway production environment
          if (process.env.NODE_ENV === 'production') {
            // Debug config loading
            console.log('Debugging config service...');
            try {
              const mongoConfig = config.get('mongodb');
              console.log('MongoDB config:', mongoConfig);
            } catch (error) {
              console.log('Error getting MongoDB config:', error.message);
            }
            
            // Force use the correct database URL - ignore environment variables for now
            const finalDatabaseUrl = 'mongodb+srv://shiv:Admin@123@eventbooking.4hxsvht.mongodb.net/event_booking?retryWrites=true&w=majority&appName=EventBooking';
            
            console.log('Production mode - Database URL configured');
            console.log('NODE_ENV:', process.env.NODE_ENV);
            console.log('Using hardcoded database URL for event_booking database');
            console.log('Database URL preview:', finalDatabaseUrl.substring(0, 50) + '...');
            
            // Log the actual database URL being used (masked)
            if (finalDatabaseUrl) {
              const maskedUrl = finalDatabaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
              console.log('Actual database URL being used:', maskedUrl);
            }
            
            // Log other important environment variables
            console.log('PORT:', process.env.PORT || 'Not set');
            console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
            console.log('CORS_ORIGINS:', process.env.CORS_ORIGINS ? 'Set' : 'Not set');
            
            if (!finalDatabaseUrl) {
              throw new Error('Database URL not found in environment variables or config');
            }
            
            return {
              type: 'mongodb',
              url: finalDatabaseUrl,
              database: 'event_booking', // Explicitly specify database name
              entities: [
                __dirname + '/**/*.mongo.entity{.ts,.js}',
                __dirname + '/**/*.entity{.ts,.js}'
              ],
              entityPrefix: '',
              synchronize: false,
              autoLoadEntities: true,
              logging: ["query", "error"],
              useNewUrlParser: true,
              useUnifiedTopology: true,
              tls: true,
              tlsAllowInvalidCertificates: false,
              tlsInsecure: false,
              minTLSVersion: 'TLSv1.2',
              retryWrites: true,
              w: 'majority',
              appName: 'EventBooking',
              maxPoolSize: 10,
              serverSelectionTimeoutMS: 5000,
              socketTimeoutMS: 45000,
              connectTimeoutMS: 10000
            };
          }
          
          // For other environments, use config
          const typeOrmConfig = Object.assign(
              {
                  entities: [
                      __dirname + '/**/*.mongo.entity{.ts,.js}',
                      __dirname + '/**/*.entity{.ts,.js}'
                  ],
                  synchronize: false,
                  autoLoadEntities: true,
                  tls: true,
                  tlsAllowInvalidCertificates: false,
                  tlsInsecure: false,
                  minTLSVersion: 'TLSv1.2',
                  logging: ["query", "error"]
              },
              config.get('mongodb'),
          );
          return typeOrmConfig;
      },
      inject: [ConfigService],
    }),
    LoggerModule,
    EmailModule,
    PdfModule,
    AuthModule,
    UserModule,
    EventModule,    
    AdminModule,  
    FeatureModule,
    RoleModule,
    FieldModule,
    FormModule,
    ServiceCategoryModule,
    ServiceCategoryFormInputsModule,
    SimilarModule,
    VenueModule,
    VendorModule,
    EnterpriseModule,
    VenueCategoryModule,
    ContentPolicyModule,
    VenueBookingModule,
    BookingModule,
    VendorCategoryModule,
    FaqModule,
    ProfileModule,
    OfferModule,
    FeedbackModule,
    NotificationModule,
    BannerModule,
    TestimonialModule,
    LocationModule,
    RatingModule,
    QuotationRequestModule,
    MealTypeModule,
    CuisineModule,
    ServingStyleModule,
    AdditionalServiceModule,
    SupabaseModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [
    HandlebarsService,
    AppService,
  ],
  exports:[],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
  
}