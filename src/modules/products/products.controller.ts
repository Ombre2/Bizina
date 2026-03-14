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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    description: 'Produit créé avec succès',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createProductDto: CreateProductDto) {
    const result = await this.productsService.create(createProductDto);

    return ResponseUtil.success(
      result,
      'Produit créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les produits' })
  @ApiOkResponse({
    description: 'Liste des produits récupérée',
    type: Product,
    isArray: true,
  })
  async findAll() {
    const result = await this.productsService.findAll();

    return ResponseUtil.success(result, 'Liste des produits récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un produit par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du produit' })
  @ApiOkResponse({
    description: 'Produit retourné avec succès',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Produit introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.productsService.findOne(id);

    return ResponseUtil.success(result, 'Produit récupéré avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du produit' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Produit mis à jour avec succès',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Produit introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const result = await this.productsService.update(id, updateProductDto);

    return ResponseUtil.success(result, 'Produit mis à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du produit' })
  @ApiOkResponse({ description: 'Produit supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Produit introuvable' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);

    return ResponseUtil.success(
      null,
      'Produit supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
