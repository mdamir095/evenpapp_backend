import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { Form } from './entity/form.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Form], 'mongo')],
    controllers: [FormController],
    providers: [FormService], 
    exports: [FormService],
})
export class FormModule {
    
}
