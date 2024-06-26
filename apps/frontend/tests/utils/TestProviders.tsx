import { ReactNode } from 'react';
import UserProvider from '../../src/contexts/UserProvider';

interface Props {
  children: ReactNode;
}

const TestProviders = ({ children }: Props) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

export default TestProviders;
