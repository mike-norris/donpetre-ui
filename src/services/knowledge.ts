import api from './api';
import { KnowledgeItem, PaginatedResponse, SearchRequest, SearchResponse } from '../types';

export const knowledgeService = {
  async getKnowledgeItems(page = 0, size = 20): Promise<PaginatedResponse<KnowledgeItem>> {
    const response = await api.get<PaginatedResponse<KnowledgeItem>>('/knowledge', {
      page,
      size,
    });
    return response.data;
  },

  async getKnowledgeItem(id: string): Promise<KnowledgeItem> {
    const response = await api.get<KnowledgeItem>(`/knowledge/${id}`);
    return response.data;
  },

  async createKnowledgeItem(item: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    const response = await api.post<KnowledgeItem>('/knowledge', item);
    return response.data;
  },

  async updateKnowledgeItem(id: string, item: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    const response = await api.put<KnowledgeItem>(`/knowledge/${id}`, item);
    return response.data;
  },

  async deleteKnowledgeItem(id: string): Promise<void> {
    await api.delete(`/knowledge/${id}`);
  },

  async searchKnowledge(request: SearchRequest): Promise<SearchResponse> {
    const response = await api.post<SearchResponse>('/knowledge/search', request);
    return response.data;
  },

  async getKnowledgeByTag(
    tag: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<KnowledgeItem>> {
    const response = await api.get<PaginatedResponse<KnowledgeItem>>(
      '/knowledge/tags/' + encodeURIComponent(tag),
      {
        page,
        size,
      }
    );
    return response.data;
  },
};
