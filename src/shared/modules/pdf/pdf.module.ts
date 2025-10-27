import { Global, Module } from '@nestjs/common'; 
import { PdfService } from './pdf.service';
@Global()
@Module({ 
      controllers: [],
        providers: [
            PdfService
        ],
        exports: [
            PdfService
        ],
        imports:[ 
        ]
})
export class PdfModule { }
