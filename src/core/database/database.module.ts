import { AwsSecretsService } from '@core/aws/services/aws-secrets.service';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Global()
@Module({
  providers: [AwsSecretsService,ConfigService],
  exports: [AwsSecretsService],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [AwsSecretsService,ConfigService],
          useFactory: async (awsSecretsService: AwsSecretsService,configService: ConfigService) => {
            // Check if we're in production (Railway) and use environment variables
            if (process.env.NODE_ENV === 'production') {
              const databaseUrl = process.env.DATABASE_URL || configService.get('database.url');
              return {
                type: 'mongodb',
                url: databaseUrl,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: false,
                logging: ["query", "error"]
              } as TypeOrmModuleOptions;
            }
            
            // For other environments, use AWS Secrets Manager
            const secretName = configService.get("aws.secretname");
            const dbSecrets = await awsSecretsService.getSecret(secretName);
            const typeOrmConfig = Object.assign(
              {
                type: 'mongodb',
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: false,
                logging: ["query", "error"]
              },
              dbSecrets
          );
            return typeOrmConfig as TypeOrmModuleOptions;
          },
        }),
      ],
    };
  }
}