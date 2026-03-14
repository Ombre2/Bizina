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
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';
import { UnitsService } from './units.service';

@ApiTags('Units')
@Controller('units')
@UseInterceptors(ClassSerializerInterceptor)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle unité' })
  @ApiBody({ type: CreateUnitDto })
  @ApiCreatedResponse({ description: 'Unité créée avec succès', type: Unit })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createUnitDto: CreateUnitDto) {
    const result = await this.unitsService.create(createUnitDto);

    return ResponseUtil.success(
      result,
      'Unité créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les unités' })
  @ApiOkResponse({
    description: 'Liste des unités récupérée',
    type: Unit,
    isArray: true,
  })
  async findAll() {
    const result = await this.unitsService.findAll();

    return ResponseUtil.success(result, 'Liste des unités récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une unité par son identifiant' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'unité" })
  @ApiOkResponse({ description: 'Unité retournée avec succès', type: Unit })
  @ApiNotFoundResponse({ description: 'Unité introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.unitsService.findOne(id);

    return ResponseUtil.success(result, 'Unité récupérée avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une unité' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'unité" })
  @ApiBody({ type: UpdateUnitDto })
  @ApiOkResponse({ description: 'Unité mise à jour avec succès', type: Unit })
  @ApiNotFoundResponse({ description: 'Unité introuvable' })
  async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    const result = await this.unitsService.update(id, updateUnitDto);

    return ResponseUtil.success(result, 'Unité mise à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une unité' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'unité" })
  @ApiOkResponse({ description: 'Unité supprimée avec succès' })
  @ApiNotFoundResponse({ description: 'Unité introuvable' })
  async remove(@Param('id') id: string) {
    await this.unitsService.remove(id);

    return ResponseUtil.success(
      null,
      'Unité supprimée avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
