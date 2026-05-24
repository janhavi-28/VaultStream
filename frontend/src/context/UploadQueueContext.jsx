import React, { createContext, useContext } from 'react';
import { useUploadQueue as useUploadQueueHook } from '../hooks/useUploadQueue';

const UploadQueueContext = createContext(null);

export const UploadQueueProvider = ({ children }) => {
  const uploadQueueState = useUploadQueueHook();

  return (
    <UploadQueueContext.Provider value={uploadQueueState}>
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploadQueueContext = () => {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error('useUploadQueueContext must be used within an UploadQueueProvider');
  }
  return context;
};
