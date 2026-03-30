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
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { SaleItem } from './entities/sale-item.entity';
import { SaleItemsService } from './sale-items.service';

@ApiTags('Sale Items')
@Controller('sale-items')
@UseInterceptors(ClassSerializerInterceptor)
export class SaleItemsController {
  constructor(private readonly saleItemsService: SaleItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une ligne de vente' })
  @ApiBody({ type: CreateSaleItemDto })
  @ApiCreatedResponse({
    description: 'Ligne de vente créée avec succès',
    type: SaleItem,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createSaleItemDto: CreateSaleItemDto) {
    const result = await this.saleItemsService.create(createSaleItemDto);

    return ResponseUtil.success(
      result,
      'Ligne de vente créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les lignes de vente' })
  @ApiOkResponse({
    description: 'Liste des lignes de vente récupérée',
    type: SaleItem,
    isArray: true,
  })
  async findAll() {
    const result = await this.saleItemsService.findAll();

    return ResponseUtil.success(result, 'Liste des lignes de vente récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une ligne de vente par identifiant' })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la ligne de vente',
  })
  @ApiOkResponse({
    description: 'Ligne de vente retournée avec succès',
    type: SaleItem,
  })
  @ApiNotFoundResponse({ description: 'Ligne de vente introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.saleItemsService.findOne(id);

    return ResponseUtil.success(result, 'Ligne de vente récupérée');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une ligne de vente' })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la ligne de vente',
  })
  @ApiOkResponse({ description: 'Ligne de vente supprimée avec succès' })
  @ApiNotFoundResponse({ description: 'Ligne de vente introuvable' })
  async remove(@Param('id') id: string) {
    await this.saleItemsService.remove(id);

    return ResponseUtil.success(
      null,
      'Ligne de vente supprimée avec succès',
      undefined,
      HttpStatus.OK,
    );
  }

  @Get('sale/:saleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister les lignes de vente d'une vente" })
  @ApiParam({
    name: 'saleId',
    description: 'Identifiant UUID de la vente',
  })
  @ApiOkResponse({
    description: 'Liste des lignes de vente récupérée',
    type: SaleItem,
    isArray: true,
  })
  async findBySale(@Param('saleId') saleId: string) {
    const result = await this.saleItemsService.findBySale(saleId);

    return ResponseUtil.success(result, 'Liste des lignes de vente récupérée');
  }
}
