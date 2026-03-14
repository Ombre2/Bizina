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
  @ApiOperation({ summary: 'Créer un nouvel achat' })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiCreatedResponse({
    description: 'Achat créé avec succès',
    type: Purchase,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return Promise.resolve(this.purchaseService.create(createPurchaseDto)).then(
      (result) =>
        ResponseUtil.success(
          result,
          'Achat créé avec succès',
          undefined,
          HttpStatus.CREATED,
        ),
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
  findAll() {
    return Promise.resolve(this.purchaseService.findAll()).then((result) =>
      ResponseUtil.success(result, 'Liste des achats récupérée'),
    );
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
  findOne(@Param('id') id: string) {
    return Promise.resolve(this.purchaseService.findOne(id)).then((result) =>
      ResponseUtil.success(result, 'Achat récupéré avec succès'),
    );
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
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return Promise.resolve(
      this.purchaseService.update(id, updatePurchaseDto),
    ).then((result) =>
      ResponseUtil.success(result, 'Achat mis à jour avec succès'),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un achat' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'achat" })
  @ApiOkResponse({ description: 'Achat supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Achat introuvable' })
  remove(@Param('id') id: string) {
    return Promise.resolve(this.purchaseService.remove(id)).then(() =>
      ResponseUtil.success(
        null,
        'Achat supprimé avec succès',
        undefined,
        HttpStatus.OK,
      ),
    );
  }
}
