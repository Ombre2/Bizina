import { MissionStatus } from 'src/modules/mission/entities/mission.entity';

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

export type PaginationMissionParams = PaginationParams & {
  startDate?: string;
  endDate?: string;
  status?: MissionStatus;
  assignedTo?: string;
};
