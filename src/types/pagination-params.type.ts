// src/common/types/pagination-params.type.ts
export type PaginationParams = {
  page: number;
  limit: number;
  searchQuery?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
