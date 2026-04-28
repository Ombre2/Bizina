import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/config/jwt-auth.guard';
import { ResponseUtil } from 'src/utils/response.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Creer un nouvel utilisateur' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      validPayload: {
        summary: 'Creation reussie',
        value: {
          username: 'cashier_bizina',
          email: 'cashier@bizina.com',
          password: 'StrongPass123!',
          role: 'cashier',
        },
      },
      invalidPayload: {
        summary: 'Creation en echec (email invalide)',
        value: {
          username: '',
          email: 'not-an-email',
          password: '',
          role: 'wrong-role',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Utilisateur cree avec succes',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Requete invalide (DTO/validation)' })
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);

    return ResponseUtil.success(
      result,
      'Inscription reussie',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @ApiOkResponse({
    description: 'Liste des utilisateurs',
    type: User,
    isArray: true,
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    const { data, total, hasNextPage, hasPreviousPage } =
      await this.usersService.findAll({ page, limit });

    return ResponseUtil.success(data, 'Liste des utilisateurs recuperee', {
      total,
      page: Number(page),
      limit: Number(limit),
      hasNextPage,
      hasPreviousPage,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recuperer un utilisateur par son id' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'utilisateur" })
  @ApiOkResponse({
    description: 'Utilisateur retourne avec succes',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(id);

    if (!result) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return ResponseUtil.success(result, 'Utilisateur recupere avec succes');
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre a jour un utilisateur' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'utilisateur" })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Utilisateur mis a jour avec succes',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(id, updateUserDto);

    return ResponseUtil.success(result, 'Utilisateur mis a jour avec succes');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'utilisateur" })
  @ApiOkResponse({ description: 'Utilisateur supprime avec succes' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);

    return ResponseUtil.success(
      null,
      'Utilisateur supprime avec succes',
      undefined,
      HttpStatus.OK,
    );
  }
}
