import { Injectable } from '@nestjs/common';

import OpenAI from 'openai';
import {
  checkCompleteStatusUseCase,
  createMessageUseCase,
  createRunUseCase,
  createThreadUseCase,
  getMessageListUseCase,
} from './use-cases';
import { QuestionDto } from './dtos/question.dto';
import { audioToTextUseCase, textToAudioUseCase } from 'src/gpt/use-cases';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AssistantsService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  // GTP_MODEL=gpt-4o-mini
  // DALL_E_MODEL=dall-e-3
  // TTS_MODEL=tts-1
  // WHISPER_MODEL=whisper-1

  gtpModel = this.configService.get<string>('GTP_MODEL'); // process.env.GPT_MODEL;
  dallEModel = this.configService.get<string>('DALL_E_MODEL'); // process.env.DALL_E_MODEL;
  ttsModel = this.configService.get<string>('TTS_MODEL'); // process.env.TTS_MODEL;
  whisperModel = this.configService.get<string>('WHISPER_MODEL'); // process.env.WHISPER_MODEL;
  assistantBasic = this.configService.get<string>('ASSISTANT_BASIC'); // process.env.ASSISTANT_BASIC;
  assistantEnglish = this.configService.get<string>('ASSISTANT_ENGLISH'); // process.env.ASSISTANT_ENGLISH;

  constructor(private configService: ConfigService) {}

  async createThread() {
    return await createThreadUseCase(this.openai);
  }

  async createThreadAudio() {
    const thread = await createThreadUseCase(this.openai);
    await createMessageUseCase(this.openai, {
      threadId: thread.id,
      question: `
        
      `,
      role: 'assistant',
    });
    return thread;
  }

  async userQuestion(questionDto: QuestionDto, english?: boolean) {
    const { threadId, question } = questionDto;

    const message = await createMessageUseCase(this.openai, {
      threadId,
      question,
      role: 'user',
    });

    console.log({ message });

    const run = await createRunUseCase(this.openai, {
      threadId,
      assistantId: !english ? this.assistantBasic : this.assistantEnglish,
    });

    await checkCompleteStatusUseCase(this.openai, {
      runId: run.id,
      threadId: threadId,
    });

    const messages = await getMessageListUseCase(this.openai, { threadId });

    return messages;
  }

  async continueAudioConversation(
    audioFile: Express.Multer.File,
    threadId: string,
  ) {
    // 1. Transcribe el audio con Whisper
    const transcription = await audioToTextUseCase(this.openai, {
      audioFile,
      model: this.whisperModel,
      prompt: '', // Opcional: añadir contexto si es necesario
      language: 'en',
    });
    console.log({ transcription });

    // 2. Genera feedback de pronunciación
    // const feedback = await this.generatePronunciationFeedback(
    //   transcription.text,
    //   this.gtpModel,
    // );
    // console.log(feedback);

    const messages = await this.userQuestion(
      {
        threadId,
        question: transcription.text,
      },
      true,
    );
    await createMessageUseCase(this.openai, {
      threadId,
      question: transcription.text,
      role: 'user',
    });
    const message = messages[messages.length - 1];

    // 3. Genera la respuesta de la conversación con GPT
    // const responseText = await this.generateConversationResponse(
    //   transcription.text,
    //   feedback,
    //   this.gtpModel,
    // );
    // console.log(responseText);

    // 4. Convierte la respuesta a audio (TTS)
    const audioPath = await textToAudioUseCase(this.openai, {
      prompt: message.content[0],
      model: this.ttsModel,
      voice: 'nova', // Cambiar si necesitas otra voz
    });
    console.log(audioPath);

    // 5. Devuelve el feedback y el audio generado
    return audioPath;
  }

  // private async generateConversationResponse(
  //   transcription: string,
  //   feedback: string,
  //   model: string,
  // ): Promise<string> {
  //   const prompt = `
  //     The user said: "${transcription}".
  //     The feedback for the user's pronunciation is: "${feedback}".
  //     Continue the conversation naturally, encouraging the user to respond with another audio.
  //   `;

  //   const response = await this.openai.completions.create({
  //     model: 'gpt-3.5-turbo-instruct',
  //     prompt,
  //     max_tokens: 150,
  //   });
  //   console.log(response);

  //   return response.choices[0].text.trim();
  // }

  private async generatePronunciationFeedback(
    transcription: string,
    model: string,
  ): Promise<string> {
    const prompt = `
      The student said: "${transcription}".
      Provide detailed feedback on pronunciation mistakes and suggestions for improvement.
    `;
    console.log(prompt);
    console.log(model);

    const response = await this.openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 150,
    });

    return response.choices[0].text.trim();
  }
}
