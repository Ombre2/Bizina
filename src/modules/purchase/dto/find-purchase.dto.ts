import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FilterGlobalDto } from 'src/utils/filter.global.dto';

export class FindPurchaseDto extends FilterGlobalDto {
  @IsOptional()
  @IsString()
  @IsUUID('4', {
    message: "L'identifiant du fournisseur doit être un UUID valide",
  })
  supplierId?: string;
}
