import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FilterGlobalDto } from 'src/utils/filter.global.dto';
import { MissionStatus } from '../entities/mission.entity';

export class FindMissionsDto extends FilterGlobalDto {
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
