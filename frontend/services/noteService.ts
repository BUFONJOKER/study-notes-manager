import { api } from '@/lib/axios';

export const noteService = {
  async getAllNames() {
    const res = await api.get<string[]>('/notes/get_all_names');
    return res.data;
  },
  async getNotes(userId: string) {
    const res = await api.get(`/notes/${userId}`);
    return res.data;
  },
  async createNote(data: { note_id: string; user_id: string; title: string; subject: string; content: string }) {
    const res = await api.post('/notes/create_note', data);
    return res.data;
  },
  async updateNote(noteId: string, data: { title: string; subject: string; content: string }) {
    const res = await api.put(`/notes/update_note/${noteId}`, data);
    return res.data;
  },
  async deleteNote(noteId: string) {
    await api.delete(`/notes/delete_note/${noteId}`);
  }
};