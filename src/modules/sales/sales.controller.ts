import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';
import { SalesUseCaseService } from './SalesUseCaseService';

@ApiTags('Sales')
@Controller('sales')
@UseInterceptors(ClassSerializerInterceptor)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesUseCaseService: SalesUseCaseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une vente' })
  @ApiBody({ type: CreateSaleDto })
  @ApiCreatedResponse({
    description: 'Vente créée avec succès',
    type: Sale,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createSaleDto: CreateSaleDto) {
    const result =
      await this.salesUseCaseService.createSaleWithPayment(createSaleDto);

    return ResponseUtil.success(
      result,
      'Vente créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les ventes' })
  @ApiOkResponse({
    description: 'Liste des ventes récupérée',
    type: Sale,
    isArray: true,
  })
  async findAll() {
    const result = await this.salesService.findAll();

    return ResponseUtil.success(result, 'Liste des ventes récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une vente par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la vente' })
  @ApiOkResponse({
    description: 'Vente retournée avec succès',
    type: Sale,
  })
  @ApiNotFoundResponse({ description: 'Vente introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.salesService.findOne(id);

    return ResponseUtil.success(result, 'Vente récupérée avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une vente' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la vente' })
  @ApiBody({ type: UpdateSaleDto })
  @ApiOkResponse({
    description: 'Vente mise à jour avec succès',
    type: Sale,
  })
  @ApiNotFoundResponse({ description: 'Vente introuvable' })
  async update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    const result = await this.salesService.update(id, updateSaleDto);

    return ResponseUtil.success(result, 'Vente mise à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une vente' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la vente' })
  @ApiOkResponse({ description: 'Vente supprimée avec succès' })
  @ApiNotFoundResponse({ description: 'Vente introuvable' })
  async remove(@Param('id') id: string) {
    await this.salesService.remove(id);

    return ResponseUtil.success(
      null,
      'Vente supprimée avec succès',
      undefined,
      HttpStatus.OK,
    );
  }

  @Get('mission/:missionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les ventes par mission' })
  @ApiParam({
    name: 'missionId',
    description: 'Identifiant UUID de la mission',
  })
  @ApiOkResponse({
    description: 'Liste des ventes pour la mission',
    type: Sale,
    isArray: true,
  })
  async findByMission(@Param('missionId') missionId: string) {
    const result = await this.salesService.findByMission(missionId);
    console.log(result, '<<<<<<<<<');

    return ResponseUtil.success(result, 'Liste des ventes pour la mission');
  }
}
