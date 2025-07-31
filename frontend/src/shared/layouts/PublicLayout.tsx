import React from 'react';
import { DarkModeToggle } from '../DarkMode/DarkModeToggle';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="fixed bottom-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
}; 