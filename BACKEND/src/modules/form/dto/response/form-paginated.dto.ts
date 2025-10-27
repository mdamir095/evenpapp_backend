import { Form } from '../../entity/form.entity';

export interface FormPaginatedResponseDto {
  data: Form[];
  pagination: {
    total: number;
    szPage: number;
    szLimit: number;
    totalPages: number;
  };
}

