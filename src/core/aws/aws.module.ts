import { Module } from '@nestjs/common';
import { AwsSecretsService } from './services/aws-secrets.service';
import { AwsS3Service } from './services/aws-s3.service';
@Module({
    controllers: [],
    providers: [
        AwsS3Service,
        AwsSecretsService
    ],
    imports: [
    ],
    exports: [   
        AwsS3Service,  
    ]
})
export class AwsModule { }
