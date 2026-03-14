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
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchases')
@Controller('purchases')
@UseInterceptors(ClassSerializerInterceptor)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un achat (entête + lignes)' })
  @ApiBody({
    type: CreatePurchaseDto,
    description:
      'Créer un achat et ses lignes en une seule requête. Le total est calculé côté serveur.',
    examples: {
      createPurchaseWithItems: {
        summary: 'Exemple création achat complet',
        value: {
          supplierId: 'f63ee3fe-2d2b-480a-8f1d-34d56d2233c9',
          purchaseDate: '2026-03-14T10:30:00.000Z',
          items: [
            {
              productUnitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              quantity: '12.500',
              unitPrice: '2500.00',
            },
            {
              productUnitId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
              quantity: '4.000',
              unitPrice: '1300.00',
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Achat créé avec succès',
    type: Purchase,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const result = await this.purchaseService.create(createPurchaseDto);

    return ResponseUtil.success(
      result,
      'Achat créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les achats' })
  @ApiOkResponse({
    description: 'Liste des achats récupérée',
    type: Purchase,
    isArray: true,
  })
  async findAll() {
    const result = await this.purchaseService.findAll();

    return ResponseUtil.success(result, 'Liste des achats récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un achat par son identifiant' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'achat" })
  @ApiOkResponse({
    description: 'Achat retourné avec succès',
    type: Purchase,
  })
  @ApiNotFoundResponse({ description: 'Achat introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.purchaseService.findOne(id);

    return ResponseUtil.success(result, 'Achat récupéré avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un achat' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'achat" })
  @ApiBody({ type: UpdatePurchaseDto })
  @ApiOkResponse({
    description: 'Achat mis à jour avec succès',
    type: Purchase,
  })
  @ApiNotFoundResponse({ description: 'Achat introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    const result = await this.purchaseService.update(id, updatePurchaseDto);

    return ResponseUtil.success(result, 'Achat mis à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un achat' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'achat" })
  @ApiOkResponse({ description: 'Achat supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Achat introuvable' })
  async remove(@Param('id') id: string) {
    await this.purchaseService.remove(id);

    return ResponseUtil.success(
      null,
      'Achat supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
