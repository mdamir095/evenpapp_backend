import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class HandlebarsService {
  constructor() {
    Handlebars.registerHelper('equal', (value1: any, value2: any, options: any) => {
      return value1 === value2 ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('split', function (value, delimiter, index) {
      if (typeof value === 'string' && typeof delimiter === 'string') {
          const parts = value.split(delimiter);
          return parts[index] || '';
      }
      return '';
  });
  }
}
