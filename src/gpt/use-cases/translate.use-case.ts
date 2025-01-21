import OpenAI from 'openai';

interface Options {
  prompt: string;
  lang: string;
  model: string;
}

export const translateUseCase = async (
  openai: OpenAI,
  { prompt, lang, model }: Options,
) => {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `Traduce el siguiente texto al idioma ${lang}:${prompt}`,
      },
    ],
    temperature: 0.2,
    // max_tokens: 500
  });

  return { message: response.choices[0].message.content };
};
