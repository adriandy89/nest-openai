import * as path from 'path';
import * as fs from 'fs';

import { Injectable, NotFoundException } from '@nestjs/common';

import OpenAI from 'openai';

import {
  audioToTextUseCase,
  imageGenerationUseCase,
  imageToTextUseCase,
  imageVariationUseCase,
  orthographyCheckUseCase,
  prosConsDicusserStreamUseCase,
  prosConsDicusserUseCase,
  textToAudioUseCase,
  translateUseCase,
} from './use-cases';
import {
  AudioToTextDto,
  ImageGenerationDto,
  ImageVariationDto,
  OrthographyDto,
  ProsConsDiscusserDto,
  TextToAudioDto,
  TranslateDto,
} from './dtos';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GptService {
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

  constructor(private configService: ConfigService) {}

  // Solo va a llamar casos de uso

  async orthographyCheck(orthographyDto: OrthographyDto) {
    return await orthographyCheckUseCase(this.openai, {
      prompt: orthographyDto.prompt,
      model: this.gtpModel,
    });
  }

  async prosConsDicusser({ prompt }: ProsConsDiscusserDto) {
    console.log(this.gtpModel);

    return await prosConsDicusserUseCase(this.openai, {
      prompt,
      model: this.gtpModel,
    });
  }

  async prosConsDicusserStream({ prompt }: ProsConsDiscusserDto) {
    console.log(this.gtpModel);

    return await prosConsDicusserStreamUseCase(this.openai, {
      prompt,
      model: this.gtpModel,
    });
  }

  async translateText({ prompt, lang }: TranslateDto) {
    return await translateUseCase(this.openai, {
      prompt,
      lang,
      model: this.gtpModel,
    });
  }

  async textToAudio({ prompt, voice }: TextToAudioDto) {
    return await textToAudioUseCase(this.openai, {
      prompt,
      voice,
      model: this.ttsModel,
    });
  }

  async textToAudioGetter(fileId: string) {
    const filePath = path.resolve(
      __dirname,
      '../../generated/audios/',
      `${fileId}.mp3`,
    );

    const wasFound = fs.existsSync(filePath);

    if (!wasFound) throw new NotFoundException(`File ${fileId} not found`);

    return filePath;
  }

  async audioToText(
    audioFile: Express.Multer.File,
    audioToTextDto: AudioToTextDto,
  ) {
    const { prompt } = audioToTextDto;

    return await audioToTextUseCase(this.openai, {
      audioFile,
      prompt,
      model: this.whisperModel,
      language: 'es',
    });
  }

  async imageGeneration(imageGenerationDto: ImageGenerationDto) {
    return await imageGenerationUseCase(this.openai, {
      ...imageGenerationDto,
      model: this.dallEModel,
    });
  }

  getGeneratedImage(fileName: string) {
    const filePath = path.resolve('./', './generated/images/', fileName);
    const exists = fs.existsSync(filePath);

    if (!exists) {
      throw new NotFoundException('File not found');
    }

    return filePath;
  }

  async geneateImageVariation({ baseImage }: ImageVariationDto) {
    return imageVariationUseCase(this.openai, {
      baseImage,
      model: 'dall-e-2',
    });
  }

  async imageToText(imageFile: Express.Multer.File, prompt: string) {
    return await imageToTextUseCase(this.openai, {
      imageFile,
      prompt,
      model: this.gtpModel,
    });
  }
}
