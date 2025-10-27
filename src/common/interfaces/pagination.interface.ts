import { IPaginationMeta } from "./paginationMeta.interface";


export interface IPagination<T> {
  data: T[];
  pagination: IPaginationMeta;
}