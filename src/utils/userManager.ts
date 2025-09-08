// User management utilities for MathMentor
import { apiService, type User, type LeaderboardEntry } from './apiService';

// Re-export types for backward compatibility
export type { User, LeaderboardEntry };

const CURRENT_USER_KEY = 'mathmentor_current_user';

export class UserManager {
  private static instance: UserManager;
  private currentUser: User | null = null;

  private constructor() {
    this.loadCurrentUser();
  }

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  private loadCurrentUser(): void {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
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
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Failed to save current user:', error);
    }
  }

  public async createUser(name: string): Promise<User> {
    try {
      const user = await apiService.createUser(name);
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
      const updatedUser = await apiService.updateUserStats(this.currentUser.id, correct, xpGained);
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }

  public async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      return await apiService.getLeaderboard(limit);
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  public async getUserRank(userId: string): Promise<number> {
    try {
      return await apiService.getUserRank(userId);
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return 0;
    }
  }

  public async resetUserData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      await apiService.resetUserData(this.currentUser.id);
      // Refresh current user data
      const updatedUser = await apiService.getUser(this.currentUser.id);
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
      return await apiService.getUserCount();
    } catch (error) {
      console.error('Failed to get user count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const userManager = UserManager.getInstance();
