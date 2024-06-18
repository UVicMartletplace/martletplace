export interface User {
  id: string;
  username: string;
  name: string;
}

export const defaultUser: User = {
  id: "123",
  username: "defaultUser",
  name: "Default User",
};

export const getDefaultUser = (): User => defaultUser;
