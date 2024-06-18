export interface User {
    id: string;
    username: string;
    name: string;
  }
  
  // Define a default user object
  export const defaultUser: User = {
    id: '123',
    username: 'defaultUser',
    name: 'Default User'
  };
  
  export const getDefaultUser = (): User => defaultUser;
  