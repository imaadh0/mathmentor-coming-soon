// API service for communicating with the backend
const API_BASE_URL = 'https://simple-hang-adopted-constructed.trycloudflare.com/api';

export interface User {
  id: string;
  name: string;
  xp: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastPlayed: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  accuracy: number;
  totalQuestions: number;
  rank: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createUser(name: string): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUserStats(userId: string, correct: boolean, xpGained: number = 0): Promise<User> {
    return this.request<User>(`/users/${userId}/stats`, {
      method: 'PUT',
      body: JSON.stringify({ correct, xpGained }),
    });
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
  }

  async getUserRank(userId: string): Promise<number> {
    const response = await this.request<{ rank: number }>(`/users/${userId}/rank`);
    return response.rank;
  }

  async resetUserData(userId: string): Promise<void> {
    await this.request(`/users/${userId}/reset`, {
      method: 'PUT',
    });
  }

  async getUserCount(): Promise<number> {
    const response = await this.request<{ count: number }>('/users/count');
    return response.count;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();

