import OpenAI from 'openai';

interface Options {
  threadId: string;
  question: string;
  role: 'user' | 'assistant';
}

export const createMessageUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { threadId, question, role } = options;

  const message = await openai.beta.threads.messages.create(threadId, {
    role,
    content: question,
  });

  return message;
};
