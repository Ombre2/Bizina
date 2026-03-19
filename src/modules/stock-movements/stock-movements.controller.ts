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
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementsService } from './stock-movements.service';

@ApiTags('Stock Movements')
@Controller('stock-movements')
@UseInterceptors(ClassSerializerInterceptor)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau mouvement de stock' })
  @ApiBody({ type: CreateStockMovementDto })
  @ApiCreatedResponse({
    description: 'Mouvement de stock créé avec succès',
    type: StockMovement,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createStockMovementDto: CreateStockMovementDto) {
    const result = await this.stockMovementsService.create(
      createStockMovementDto,
    );

    return ResponseUtil.success(
      result,
      'Mouvement de stock créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les mouvements de stock' })
  @ApiOkResponse({
    description: 'Liste des mouvements de stock récupérée',
    type: StockMovement,
    isArray: true,
  })
  async findAll() {
    const result = await this.stockMovementsService.findAll();

    return ResponseUtil.success(
      result,
      'Liste des mouvements de stock récupérée',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer un mouvement de stock par son identifiant',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID du mouvement de stock',
  })
  @ApiOkResponse({
    description: 'Mouvement de stock retourné avec succès',
    type: StockMovement,
  })
  @ApiNotFoundResponse({ description: 'Mouvement de stock introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.stockMovementsService.findOne(id);

    return ResponseUtil.success(
      result,
      'Mouvement de stock récupéré avec succès',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un mouvement de stock' })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID du mouvement de stock',
  })
  @ApiOkResponse({ description: 'Mouvement de stock supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Mouvement de stock introuvable' })
  async remove(@Param('id') id: string) {
    await this.stockMovementsService.remove(id);

    return ResponseUtil.success(
      null,
      'Mouvement de stock supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
