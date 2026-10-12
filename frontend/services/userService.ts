import { api } from '@/lib/axios';

export const userService = {
  async createUser(data: { user_name: string; password: string }) {
    const res = await api.post('/users/', data);
    return res.data;
  },
  async getAllUsers() {
    const res = await api.get('/users/');
    return res.data;
  },
  async getUser(userId: number) {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },
  async updateUser(userId: number, data: { user_name?: string; password?: string }) {
    const res = await api.put(`/users/${userId}`, data);
    return res.data;
  },
  async deleteUser(userId: number) {
    await api.delete(`/users/${userId}`);
  }
};