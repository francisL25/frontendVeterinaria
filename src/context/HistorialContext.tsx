import React, { createContext, useState, useCallback } from 'react';

interface HistorialContextType {
  triggerRefetch: () => void;
  refetchFlag: boolean;
}

export const HistorialContext = createContext<HistorialContextType>({
  triggerRefetch: () => {},
  refetchFlag: false,
});

export const HistorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refetchFlag, setRefetchFlag] = useState(false);

  const triggerRefetch = useCallback(() => {
    setRefetchFlag((prev) => !prev);
  }, []);

  return (
    <HistorialContext.Provider value={{ triggerRefetch, refetchFlag }}>
      {children}
    </HistorialContext.Provider>
  );
};