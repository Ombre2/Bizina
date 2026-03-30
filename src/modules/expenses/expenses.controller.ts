import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/jwt-auth.guard';
import { ResponseUtil } from 'src/utils/response.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle dépense' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiCreatedResponse({
    description: 'Dépense créée avec succès',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    const result = await this.expensesService.create(createExpenseDto);
    return ResponseUtil.success(
      result,
      'Dépense créée avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les dépenses' })
  @ApiOkResponse({
    description: 'Liste des dépenses récupérée',
    type: [Object],
  })
  async findAll() {
    const result = await this.expensesService.findAll();
    return ResponseUtil.success(result, 'Liste des dépenses récupérée');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une dépense par ID' })
  @ApiOkResponse({ description: 'Dépense récupérée avec succès', type: Object })
  @ApiNotFoundResponse({ description: 'Dépense non trouvée' })
  async findOne(@Param('id') id: string) {
    const result = await this.expensesService.findOne(id);
    return ResponseUtil.success(result, 'Dépense récupérée avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une dépense' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiOkResponse({
    description: 'Dépense mise à jour avec succès',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'Dépense non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const result = await this.expensesService.update(id, updateExpenseDto);
    return ResponseUtil.success(result, 'Dépense mise à jour avec succès');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une dépense' })
  @ApiOkResponse({ description: 'Dépense supprimée avec succès' })
  @ApiNotFoundResponse({ description: 'Dépense non trouvée' })
  async remove(@Param('id') id: string) {
    await this.expensesService.remove(id);
    return ResponseUtil.success({}, 'Dépense supprimée avec succès');
  }

  @Get('mission/:missionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les dépenses d'une mission" })
  @ApiOkResponse({
    description: 'Dépenses récupérées avec succès',
    type: [Object],
  })
  @ApiNotFoundResponse({ description: 'Mission non trouvée' })
  async findByMission(@Param('missionId') missionId: string) {
    const result = await this.expensesService.findByMission(missionId);
    return ResponseUtil.success(result, 'Dépenses récupérées avec succès');
  }
}
