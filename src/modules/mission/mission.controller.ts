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
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { Mission } from './entities/mission.entity';
import { MissionService } from './mission.service';

@ApiTags('Missions')
@Controller('missions')
@UseInterceptors(ClassSerializerInterceptor)
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle mission' })
  @ApiBody({ type: CreateMissionDto })
  @ApiCreatedResponse({
    description: 'Mission créée avec succès',
    type: Mission,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createMissionDto: CreateMissionDto) {
    const result = await this.missionService.create(createMissionDto);
    return ResponseUtil.success(
      result,
      'Mission créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les missions' })
  @ApiOkResponse({
    description: 'Liste des missions récupérée',
    type: Mission,
    isArray: true,
  })
  async findAll() {
    const result = await this.missionService.findAll();
    return ResponseUtil.success(result, 'Liste des missions récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une mission par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant de la mission' })
  @ApiOkResponse({
    description: 'Mission retournée avec succès',
    type: Mission,
  })
  @ApiNotFoundResponse({ description: 'Mission introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.missionService.findOne(id);
    return ResponseUtil.success(result, 'Mission récupérée avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une mission' })
  @ApiParam({ name: 'id', description: 'Identifiant de la mission' })
  @ApiBody({ type: UpdateMissionDto })
  @ApiOkResponse({
    description: 'Mission mise à jour avec succès',
    type: Mission,
  })
  @ApiNotFoundResponse({ description: 'Mission introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateMissionDto: UpdateMissionDto,
  ) {
    const result = await this.missionService.update(id, updateMissionDto);
    return ResponseUtil.success(result, 'Mission mise à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une mission' })
  @ApiParam({ name: 'id', description: 'Identifiant de la mission' })
  @ApiOkResponse({ description: 'Mission supprimée avec succès' })
  @ApiNotFoundResponse({ description: 'Mission introuvable' })
  async remove(@Param('id') id: string) {
    await this.missionService.remove(id);
    return ResponseUtil.success(
      null,
      'Mission supprimée avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
