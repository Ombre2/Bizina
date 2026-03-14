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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseInterceptors(ClassSerializerInterceptor)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau fournisseur' })
  @ApiBody({ type: CreateSupplierDto })
  @ApiCreatedResponse({
    description: 'Fournisseur créé avec succès',
    type: Supplier,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    const result = await this.suppliersService.create(createSupplierDto);

    return ResponseUtil.success(
      result,
      'Fournisseur créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les fournisseurs' })
  @ApiOkResponse({
    description: 'Liste des fournisseurs récupérée',
    type: Supplier,
    isArray: true,
  })
  async findAll() {
    const result = await this.suppliersService.findAll();

    return ResponseUtil.success(result, 'Liste des fournisseurs récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un fournisseur par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiOkResponse({
    description: 'Fournisseur retourné avec succès',
    type: Supplier,
  })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.suppliersService.findOne(id);

    return ResponseUtil.success(result, 'Fournisseur récupéré avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un fournisseur' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiOkResponse({
    description: 'Fournisseur mis à jour avec succès',
    type: Supplier,
  })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    const result = await this.suppliersService.update(id, updateSupplierDto);

    return ResponseUtil.success(result, 'Fournisseur mis à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un fournisseur' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiOkResponse({ description: 'Fournisseur supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  async remove(@Param('id') id: string) {
    await this.suppliersService.remove(id);

    return ResponseUtil.success(
      null,
      'Fournisseur supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
