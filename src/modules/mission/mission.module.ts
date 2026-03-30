import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Mission } from './entities/mission.entity';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mission]), UsersModule],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
