import { Module } from '@nestjs/common';  
import { HttpApiService } from './http-api.service';
import { HttpModule, HttpService } from '@nestjs/axios'; 

@Module({ 
  controllers: [],
  providers: [ 
    HttpApiService
  ],
  exports: [
    HttpApiService
  ],
  imports: [ 
    HttpModule
  ]
})
export class HttpApiModule { }
