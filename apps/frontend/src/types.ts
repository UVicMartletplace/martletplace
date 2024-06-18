export interface User {
  id: string;
  username: string;
  name: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
