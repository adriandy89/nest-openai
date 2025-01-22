import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [GptController],
  providers: [ConfigService, GptService],
})
export class GptModule {}
