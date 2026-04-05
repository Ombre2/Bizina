import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FilterGlobalDto } from 'src/utils/filter.global.dto';
import { MovementType } from '../entities/stock-movement.entity';

export class FindStockMovementsDto extends FilterGlobalDto {
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant du produit doit être un UUID valide",
  })
  productId?: string;

  @IsOptional()
  @IsEnum(MovementType, {
    message: 'Le type de mouvement doit être purchase, sale ou adjustment',
  })
  movementType?: MovementType;
}
