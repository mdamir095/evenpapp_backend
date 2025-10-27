import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentPolicyService } from './content-policy.service';
import { ContentPolicyController } from './content-policy.controller';
import { ContentPolicy } from './entity/content-policy.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContentPolicy], 'mongo')],
    controllers: [ContentPolicyController],
    providers: [ContentPolicyService],
    exports: [ContentPolicyService],
})
export class ContentPolicyModule {

}
