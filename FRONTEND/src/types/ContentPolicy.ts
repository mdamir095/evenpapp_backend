export interface ContentPolicy {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  effectiveDate: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}
