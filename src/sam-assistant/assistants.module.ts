import { Module } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { AssistantsController } from './assistants.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [AssistantsController],
  providers: [ConfigService, AssistantsService],
})
export class AssistantsModule {}
