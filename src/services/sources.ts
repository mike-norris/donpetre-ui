import api from './api';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
  UpdateKnowledgeSourceRequest,
  PaginatedResponse,
} from '../types';

export const sourcesService = {
  async getKnowledgeSources(page = 0, size = 20): Promise<PaginatedResponse<KnowledgeSource>> {
    const response = await api.get<PaginatedResponse<KnowledgeSource>>('/knowledge-sources', {
      page,
      size,
    });
    return response.data;
  },

  async getKnowledgeSource(id: string): Promise<KnowledgeSource> {
    const response = await api.get<KnowledgeSource>(`/knowledge-sources/${id}`);
    return response.data;
  },

  async createKnowledgeSource(source: CreateKnowledgeSourceRequest): Promise<KnowledgeSource> {
    const response = await api.post<KnowledgeSource>('/knowledge-sources', source);
    return response.data;
  },

  async updateKnowledgeSource(
    id: string,
    updates: UpdateKnowledgeSourceRequest
  ): Promise<KnowledgeSource> {
    const response = await api.put<KnowledgeSource>(`/knowledge-sources/${id}`, updates);
    return response.data;
  },

  async deleteKnowledgeSource(id: string): Promise<void> {
    await api.delete(`/knowledge-sources/${id}`);
  },

  async syncKnowledgeSource(id: string): Promise<void> {
    await api.post(`/knowledge-sources/${id}/sync`, {});
  },

  async testConnection(
    source: CreateKnowledgeSourceRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/knowledge-sources/test',
      source
    );
    return response.data;
  },
};
