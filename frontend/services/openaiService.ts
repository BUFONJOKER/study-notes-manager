import { api } from '@/lib/axios';

export const openaiService = {
  async setKey(apiKey: string) {
    const res = await api.post('/openai/set-key', { api_key: apiKey });
    return res.data;
  },
  async validateKey(apiKey: string) {
    const res = await api.get('/openai/validate-key', {
      headers: { 'X-OpenAI-API-Key': apiKey },
    });
    return res.data;
  },
  async generateQuiz(noteId: string, apiKey: string) {
    const res = await api.post(
      `/notes/quiz_generation/${noteId}`,
      {},
      {
        headers: { 'X-OpenAI-API-Key': apiKey },
        responseType: 'stream',
      }
    );
    return res;
  },
};