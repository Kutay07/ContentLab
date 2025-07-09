import { User } from "./types";

class UserStore {
  private users: User[] = [];
  private initialized = false;

  /**
   * Environment'tan kullanıcıları yükle
   */
  private loadUsers(): void {
    try {
      const usersJson =
        process.env.AUTH_USERS || process.env.NEXT_PUBLIC_AUTH_USERS;

      if (!usersJson) {
        console.warn("AUTH_USERS environment variable not found");
        this.users = [];
        return;
      }

      this.users = JSON.parse(usersJson);
      console.log(`Loaded ${this.users.length} users from environment`);
    } catch (error) {
      console.error("Failed to parse AUTH_USERS:", error);
      this.users = [];
    }

    this.initialized = true;
  }

  /**
   * Kullanıcı bilgilerini al (lazy loading)
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.loadUsers();
    }
  }

  /**
   * Kullanıcı adı ve şifre ile kullanıcı bul
   */
  findUser(username: string, password: string): User | null {
    this.ensureInitialized();

    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    return user || null;
  }

  /**
   * ID ile kullanıcı bul
   */
  findUserById(id: string): User | null {
    this.ensureInitialized();

    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  /**
   * Username ile kullanıcı bul
   */
  findUserByUsername(username: string): User | null {
    this.ensureInitialized();

    const user = this.users.find((u) => u.username === username);
    return user || null;
  }

  /**
   * Tüm kullanıcıları listele (debug amaçlı)
   */
  getAllUsers(): Omit<User, "password">[] {
    this.ensureInitialized();

    return this.users.map(({ password, ...user }) => user);
  }

  /**
   * Store'u yeniden başlat
   */
  refresh(): void {
    this.initialized = false;
    this.loadUsers();
  }
}

// Singleton instance
export const userStore = new UserStore();
