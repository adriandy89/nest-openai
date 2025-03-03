import * as fs from 'fs';

import OpenAI from 'openai';

interface Options {
  prompt?: string;
  audioFile: Express.Multer.File;
  model: string;
  language: string;
}

export const audioToTextUseCase = async (openai: OpenAI, options: Options) => {
  const { prompt, audioFile, model, language } = options;

  console.log({ prompt });

  const response = await openai.audio.transcriptions.create({
    model, //: 'whisper-1',
    file: fs.createReadStream(audioFile.path),
    prompt: prompt, // mismo idioma del audio
    language,
    // response_format: 'vtt', // 'srt',
    response_format: 'verbose_json',
  });

  return response;
};
