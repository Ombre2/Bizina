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
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsService } from './payment-methods.service';

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau mode de paiement' })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiCreatedResponse({
    description: 'Mode de paiement créé avec succès',
    type: PaymentMethod,
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    const result = await this.paymentMethodsService.create(
      createPaymentMethodDto,
    );

    return ResponseUtil.success(
      result,
      'Mode de paiement créé avec succès',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les modes de paiement' })
  @ApiOkResponse({
    description: 'Liste des modes de paiement récupérée',
    type: PaymentMethod,
    isArray: true,
  })
  async findAll() {
    const result = await this.paymentMethodsService.findAll();

    return ResponseUtil.success(
      result,
      'Liste des modes de paiement récupérée',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer un mode de paiement par son identifiant',
  })
  @ApiParam({ name: 'id', description: 'Identifiant du mode de paiement' })
  @ApiOkResponse({
    description: 'Mode de paiement retourné avec succès',
    type: PaymentMethod,
  })
  @ApiNotFoundResponse({ description: 'Mode de paiement introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.paymentMethodsService.findOne(id);

    return ResponseUtil.success(
      result,
      'Mode de paiement récupéré avec succès',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un mode de paiement' })
  @ApiParam({ name: 'id', description: 'Identifiant du mode de paiement' })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiOkResponse({
    description: 'Mode de paiement mis à jour avec succès',
    type: PaymentMethod,
  })
  @ApiNotFoundResponse({ description: 'Mode de paiement introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    const result = await this.paymentMethodsService.update(
      id,
      updatePaymentMethodDto,
    );

    return ResponseUtil.success(
      result,
      'Mode de paiement mis à jour avec succès',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un mode de paiement' })
  @ApiParam({ name: 'id', description: 'Identifiant du mode de paiement' })
  @ApiOkResponse({ description: 'Mode de paiement supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Mode de paiement introuvable' })
  async remove(@Param('id') id: string) {
    await this.paymentMethodsService.remove(id);

    return ResponseUtil.success(
      null,
      'Mode de paiement supprimé avec succès',
      undefined,
      HttpStatus.OK,
    );
  }
}
