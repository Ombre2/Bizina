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
import { CreateSalePaymentDto } from './dto/create-sale-payment.dto';
import { UpdateSalePaymentDto } from './dto/update-sale-payment.dto';
import { SalePayment } from './entities/sale-payment.entity';
import { SalePaymentsService } from './sale-payments.service';

@ApiTags('Sale Payments')
@Controller('sale-payments')
@UseInterceptors(ClassSerializerInterceptor)
export class SalePaymentsController {
  constructor(private readonly salePaymentsService: SalePaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau paiement de vente' })
  @ApiBody({ type: CreateSalePaymentDto })
  @ApiCreatedResponse({
    description: 'Paiement créé avec succès',
    type: SalePayment,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createSalePaymentDto: CreateSalePaymentDto) {
    const result = await this.salePaymentsService.create(createSalePaymentDto);

    return ResponseUtil.success(
      result,
      'Paiement créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les paiements de vente' })
  @ApiOkResponse({
    description: 'Liste des paiements récupérée',
    type: SalePayment,
    isArray: true,
  })
  async findAll() {
    const result = await this.salePaymentsService.findAll();

    return ResponseUtil.success(result, 'Liste des paiements récupérée');
  }

  @Get('sale/:saleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les paiements d\'une vente' })
  @ApiParam({ name: 'saleId', description: 'Identifiant UUID de la vente' })
  @ApiOkResponse({
    description: 'Liste des paiements de la vente',
    type: SalePayment,
    isArray: true,
  })
  async findBySaleId(@Param('saleId') saleId: string) {
    const result = await this.salePaymentsService.findBySaleId(saleId);

    return ResponseUtil.success(result, 'Paiements de la vente récupérés');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un paiement par son identifiant' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du paiement' })
  @ApiOkResponse({
    description: 'Paiement retourné avec succès',
    type: SalePayment,
  })
  @ApiNotFoundResponse({ description: 'Paiement introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.salePaymentsService.findOne(id);

    return ResponseUtil.success(result, 'Paiement récupéré avec succès');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un paiement de vente' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du paiement' })
  @ApiBody({ type: UpdateSalePaymentDto })
  @ApiOkResponse({
    description: 'Paiement mis à jour avec succès',
    type: SalePayment,
  })
  @ApiNotFoundResponse({ description: 'Paiement introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateSalePaymentDto: UpdateSalePaymentDto,
  ) {
    const result = await this.salePaymentsService.update(
      id,
      updateSalePaymentDto,
    );

    return ResponseUtil.success(result, 'Paiement mis à jour avec succès');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un paiement de vente' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du paiement' })
  @ApiOkResponse({ description: 'Paiement supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Paiement introuvable' })
  async remove(@Param('id') id: string) {
    await this.salePaymentsService.remove(id);

    return ResponseUtil.success(
      null,
      'Paiement supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
