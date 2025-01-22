import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GptModule } from './gpt/gpt.module';
import { AssistantsModule } from './sam-assistant/assistants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GptModule,
    AssistantsModule,
  ],
})
export class AppModule {}
