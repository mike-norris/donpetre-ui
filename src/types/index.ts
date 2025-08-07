export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  sourceType: 'GITHUB' | 'JIRA' | 'GITLAB' | 'MANUAL';
  sourceId?: string;
  sourceUrl?: string;
  tags: string[];
  metadata: Record<string, any>;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSource {
  id: string;
  type: 'GITHUB' | 'JIRA' | 'GITLAB';
  configuration: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeSourceRequest {
  type: 'GITHUB' | 'JIRA' | 'GITLAB';
  configuration: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateKnowledgeSourceRequest {
  configuration?: Record<string, any>;
  isActive?: boolean;
}

export interface SearchResult {
  knowledgeItem: KnowledgeItem;
  score: number;
  highlights: string[];
}

export interface SearchRequest {
  query: string;
  filters?: {
    sourceType?: string[];
    tags?: string[];
    authorId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  page?: number;
  size?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
