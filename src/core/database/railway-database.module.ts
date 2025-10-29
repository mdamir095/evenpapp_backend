import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({})
export class RailwayDatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: RailwayDatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: process.env.DATABASE_URL || 'mongodb+srv://shiv:*****@eventbooking.4hxsvht.mongodb.net',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: false,
          logging: ['query', 'error'],
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as TypeOrmModuleOptions),
      ],
    };
  }
}
