import { useState } from 'react';
import { toast } from 'react-hot-toast';

const EMPLOYEE_PASSWORD = '@T24n5_Kk_emp';

export function usePasswordProtection() {
  const [isUnlocked, setIsUnlocked] = useState(false);

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
  };

  return {
    isUnlocked,
    unlock,
    lock
  };
}