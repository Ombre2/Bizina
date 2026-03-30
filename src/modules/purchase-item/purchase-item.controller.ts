import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/jwt-auth.guard';
import { ResponseUtil } from 'src/utils/response.util';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseItemService } from './purchase-item.service';

@ApiTags('Purchase Items')
@Controller('purchase-items')
@UseInterceptors(ClassSerializerInterceptor)
export class PurchaseItemController {
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer une ligne d'achat" })
  @ApiBody({ type: CreatePurchaseItemDto })
  @ApiCreatedResponse({
    description: "Ligne d'achat créée avec succès",
    type: PurchaseItem,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createPurchaseItemDto: CreatePurchaseItemDto) {
    const result = await this.purchaseItemService.create(createPurchaseItemDto);

    return ResponseUtil.success(
      result,
      "Ligne d'achat créée avec succès",
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister toutes les lignes d'achat" })
  @ApiOkResponse({
    description: "Liste des lignes d'achat récupérée",
    type: PurchaseItem,
    isArray: true,
  })
  async findAll() {
    const result = await this.purchaseItemService.findAll();

    return ResponseUtil.success(result, "Liste des lignes d'achat récupérée");
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer une ligne d'achat par identifiant" })
  @ApiParam({ name: 'id', description: "Identifiant UUID de la ligne d'achat" })
  @ApiOkResponse({
    description: "Ligne d'achat retournée avec succès",
    type: PurchaseItem,
  })
  @ApiNotFoundResponse({ description: "Ligne d'achat introuvable" })
  async findOne(@Param('id') id: string) {
    const result = await this.purchaseItemService.findOne(id);

    return ResponseUtil.success(result, "Ligne d'achat récupérée");
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une ligne d'achat" })
  @ApiParam({ name: 'id', description: "Identifiant UUID de la ligne d'achat" })
  @ApiOkResponse({ description: "Ligne d'achat supprimée avec succès" })
  @ApiNotFoundResponse({ description: "Ligne d'achat introuvable" })
  async remove(@Param('id') id: string) {
    await this.purchaseItemService.remove(id);

    return ResponseUtil.success(
      null,
      "Ligne d'achat supprimée avec succès",
      undefined,
      HttpStatus.OK,
    );
  }

  @Get('/purchase/:purchaseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister les lignes d'achat d'un achat" })
  @ApiParam({
    name: 'purchaseId',
    description: "Identifiant UUID de l'achat",
  })
  @ApiOkResponse({
    description: "Liste des lignes d'achat  récupérée",
    type: PurchaseItem,
    isArray: true,
  })
  async findByPurchase(@Param('purchaseId') purchaseId: string) {
    const result = await this.purchaseItemService.findByPurchase(purchaseId);

    return ResponseUtil.success(result, "Liste des lignes d'achat récupérée");
  }
}
