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
  Query,
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
import { FilterGlobalDto } from 'src/utils/filter.global.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
@UseInterceptors(ClassSerializerInterceptor)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau client' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({
    description: 'Client créé avec succès',
    type: Customer,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const result = await this.customersService.create(createCustomerDto);

    return ResponseUtil.success(
      result,
      'Client créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les clients' })
  @ApiOkResponse({
    description: 'Liste des clients récupérée',
    type: Customer,
    isArray: true,
  })
  async findAll(@Query() query: FilterGlobalDto) {
    const { data, total, hasNextPage, hasPreviousPage } =
      await this.customersService.findAll(query);

    return ResponseUtil.success(data, 'Liste des clients récupérée', {
      total,
      page: query.page,
      limit: query.limit,
      hasNextPage,
      hasPreviousPage,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un client par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du client' })
  @ApiOkResponse({
    description: 'Client retourné avec succès',
    type: Customer,
  })
  @ApiNotFoundResponse({ description: 'Client introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.customersService.findOne(id);

    return ResponseUtil.success(result, 'Client récupéré avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un client' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du client' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiOkResponse({
    description: 'Client mis à jour avec succès',
    type: Customer,
  })
  @ApiNotFoundResponse({ description: 'Client introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const result = await this.customersService.update(id, updateCustomerDto);

    return ResponseUtil.success(result, 'Client mis à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un client' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du client' })
  @ApiOkResponse({ description: 'Client supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Client introuvable' })
  async remove(@Param('id') id: string) {
    await this.customersService.remove(id);

    return ResponseUtil.success(
      null,
      'Client supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
