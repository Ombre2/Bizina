import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { JwtAuthGuard } from 'src/config/jwt-auth.guard';
import { ResponseUtil } from 'src/utils/response.util';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseCategoryService } from './expense-category.service';

@Controller('expense-category')
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie de dépense' })
  @ApiBody({ type: CreateExpenseCategoryDto })
  @ApiCreatedResponse({
    description: 'Catégorie de dépense créée avec succès',
    type: ExpenseCategory,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    const result = await this.expenseCategoryService.create(
      createExpenseCategoryDto,
    );
    return ResponseUtil.success(
      result,
      'Catégorie de dépense créée avec succès',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les catégories de dépenses' })
  @ApiOkResponse({
    description: 'Liste des catégories de dépenses récupérée',
    type: ExpenseCategory,
    isArray: true,
  })
  async findAll() {
    const result = await this.expenseCategoryService.findAll();

    return ResponseUtil.success(
      result,
      'Liste des catégories de dépenses récupérée',
    );
  }
}
