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
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnit } from './entities/product-unit.entity';
import { ProductUnitsService } from './product-units.service';

@ApiTags('Product Units')
@Controller('product-units')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une association produit/unité' })
  @ApiBody({ type: CreateProductUnitDto })
  @ApiCreatedResponse({
    description: 'Association produit/unité créée avec succès',
    type: ProductUnit,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createProductUnitDto: CreateProductUnitDto) {
    const result = await this.productUnitsService.create(createProductUnitDto);

    return ResponseUtil.success(
      result,
      'Association produit/unité créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les associations produit/unité' })
  @ApiOkResponse({
    description: 'Liste des associations produit/unité récupérée',
    type: ProductUnit,
    isArray: true,
  })
  async findAll() {
    const result = await this.productUnitsService.findAll();

    return ResponseUtil.success(
      result,
      'Liste des associations produit/unité récupérée',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer une association produit/unité par son id',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID de l'association produit/unité",
  })
  @ApiOkResponse({
    description: 'Association produit/unité retournée avec succès',
    type: ProductUnit,
  })
  @ApiNotFoundResponse({ description: 'Association produit/unité introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.productUnitsService.findOne(id);

    return ResponseUtil.success(
      result,
      'Association produit/unité récupérée avec succès',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une association produit/unité' })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID de l'association produit/unité",
  })
  @ApiBody({ type: UpdateProductUnitDto })
  @ApiOkResponse({
    description: 'Association produit/unité mise à jour avec succès',
    type: ProductUnit,
  })
  @ApiNotFoundResponse({ description: 'Association produit/unité introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateProductUnitDto: UpdateProductUnitDto,
  ) {
    const result = await this.productUnitsService.update(
      id,
      updateProductUnitDto,
    );

    return ResponseUtil.success(
      result,
      'Association produit/unité mise à jour avec succès',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une association produit/unité' })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID de l'association produit/unité",
  })
  @ApiOkResponse({
    description: 'Association produit/unité supprimée avec succès',
  })
  @ApiNotFoundResponse({ description: 'Association produit/unité introuvable' })
  async remove(@Param('id') id: string) {
    await this.productUnitsService.remove(id);

    return ResponseUtil.success(
      null,
      'Association produit/unité supprimée avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
