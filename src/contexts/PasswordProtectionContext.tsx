import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const EMPLOYEE_PASSWORD = '@T24n5_Kk_emp';
const STORAGE_KEY = 'employee_access_unlocked';

interface PasswordProtectionContextType {
  isUnlocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const PasswordProtectionContext = createContext<PasswordProtectionContextType | undefined>(undefined);

export function PasswordProtectionProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isUnlocked.toString());
  }, [isUnlocked]);

  const unlock = (password: string) => {
    if (password === EMPLOYEE_PASSWORD) {
      setIsUnlocked(true);
      toast.success('Access granted');
      return true;
    }
    toast.error('Invalid password');
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PasswordProtectionContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </PasswordProtectionContext.Provider>
  );
}

export function usePasswordProtection() {
  const context = useContext(PasswordProtectionContext);
  if (context === undefined) {
    throw new Error('usePasswordProtection must be used within a PasswordProtectionProvider');
  }
  return context;
}