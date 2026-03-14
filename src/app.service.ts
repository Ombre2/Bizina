import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getEnv() {
    return this.configService.get<number>('port') || 30102;
  }
}
