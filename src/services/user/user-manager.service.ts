import { STORAGE_KEYS } from '@/constants/storage';
import { User, LeaderboardEntry } from '@/types/user';
import { userApiService } from '../api/user.service';

export class UserManagerService {
  private static instance: UserManagerService;
  private currentUser: User | null = null;

  private constructor() {
    this.loadCurrentUser();
  }

  public static getInstance(): UserManagerService {
    if (!UserManagerService.instance) {
      UserManagerService.instance = new UserManagerService();
    }
    return UserManagerService.instance;
  }

  private loadCurrentUser(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
      this.currentUser = null;
    }
  }

  private saveCurrentUser(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (error) {
      console.error('Failed to save current user:', error);
    }
  }

  public async createUser(name: string): Promise<User> {
    try {
      const user = await userApiService.createUser(name);
      this.currentUser = user;
      this.saveCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async updateUserStats(correct: boolean, xpGained: number = 0): Promise<void> {
    if (!this.currentUser) return;

    try {
      const updatedUser = await userApiService.updateUserStats(this.currentUser.id, correct, xpGained);
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }

  public async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      return await userApiService.getLeaderboard(limit);
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  public async getUserRank(userId: string): Promise<number> {
    try {
      return await userApiService.getUserRank(userId);
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return 0;
    }
  }

  public async resetUserData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      await userApiService.resetUserData(this.currentUser.id);
      // Refresh current user data
      const updatedUser = await userApiService.getUser(this.currentUser.id);
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    } catch (error) {
      console.error('Failed to reset user data:', error);
      throw error;
    }
  }

  public logout(): void {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  public hasUser(): boolean {
    return this.currentUser !== null;
  }

  public async getUserCount(): Promise<number> {
    try {
      return await userApiService.getUserCount();
    } catch (error) {
      console.error('Failed to get user count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const userManager = UserManagerService.getInstance();
