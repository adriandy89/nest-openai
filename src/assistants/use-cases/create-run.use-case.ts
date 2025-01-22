import OpenAI from 'openai';

interface Options {
  threadId: string;
  assistantId: string;
}

export const createRunUseCase = async (openai: OpenAI, options: Options) => {
  const { threadId, assistantId = 'asst_Nus6p0wFKAfBEIHwL5pxJgw7' } = options;

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    // instructions; // OJO! Sobre escribe el asistente
  });

  console.log({ run });

  return run;
};
