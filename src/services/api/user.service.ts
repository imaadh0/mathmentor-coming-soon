import { API_CONFIG } from '@/config/api';
import { User, LeaderboardEntry } from '@/types/user';
import { BaseApiService } from './base';

class UserApiService extends BaseApiService {
  async createUser(name: string): Promise<User> {
    return this.request<User>(API_CONFIG.ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
  }

  async updateUserStats(userId: string, correct: boolean, xpGained: number = 0): Promise<User> {
    return this.request<User>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/stats`, {
      method: 'PUT',
      body: JSON.stringify({ correct, xpGained }),
    });
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`${API_CONFIG.ENDPOINTS.LEADERBOARD}?limit=${limit}`);
  }

  async getUserRank(userId: string): Promise<number> {
    const response = await this.request<{ rank: number }>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/rank`);
    return response.rank;
  }

  async resetUserData(userId: string): Promise<void> {
    await this.request(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/reset`, {
      method: 'PUT',
    });
  }

  async getUserCount(): Promise<number> {
    const response = await this.request<{ count: number }>(`${API_CONFIG.ENDPOINTS.USERS}/count`);
    return response.count;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>(API_CONFIG.ENDPOINTS.HEALTH);
  }
}

export const userApiService = new UserApiService();
