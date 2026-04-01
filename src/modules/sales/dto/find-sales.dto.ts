import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FilterGlobalDto } from 'src/utils/filter.global.dto';

export class FindSalesDto extends FilterGlobalDto {
  @IsOptional()
  @IsString()
  @IsUUID('4', {
    message: "L'identifiant du client doit être un UUID valide",
  })
  customerId?: string;

  @IsOptional()
  @IsString()
  isPaid?: string; // 1 = paid, 0 = not paid, 3 = all
}
