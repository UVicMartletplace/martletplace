export interface User {
  userID: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  profileUrl: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
