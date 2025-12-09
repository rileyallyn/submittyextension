import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { VSCodeAPI } from '../types/vscode';

interface VSCodeContextValue {
  vscode: VSCodeAPI | null;
  isReady: boolean;
}

const VSCodeContext = createContext<VSCodeContextValue>({
  vscode: null,
  isReady: false,
});

interface VSCodeProviderProps {
  children: ReactNode;
}

// Module-level singleton to ensure acquireVsCodeApi is only called once
let vscodeApiInstance: VSCodeAPI | null = null;
let isAcquiring = false;

/**
 * Acquires the VS Code API instance (singleton pattern)
 * This ensures acquireVsCodeApi() is only called once per webview
 */
function getVSCodeAPI(): VSCodeAPI | null {
  // Return existing instance if already acquired
  if (vscodeApiInstance) {
    return vscodeApiInstance;
  }

  // Prevent multiple simultaneous acquisition attempts
  if (isAcquiring) {
    return null;
  }

  if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
    try {
      isAcquiring = true;
      vscodeApiInstance = window.acquireVsCodeApi();
      return vscodeApiInstance;
    } catch (error) {
      console.error('Failed to acquire VS Code API:', error);
      // If acquisition fails, create a mock API
      const mockApi: VSCodeAPI = {
        postMessage: (message: unknown) => {
          console.log('[VSCode Mock] postMessage:', message);
        },
        getState: () => undefined,
        setState: <T,>(newState: T) => newState,
      };
      vscodeApiInstance = mockApi;
      return mockApi;
    } finally {
      isAcquiring = false;
    }
  } else {
    // In development or non-VS Code environments, create a mock API
    const mockApi: VSCodeAPI = {
      postMessage: (message: unknown) => {
        console.log('[VSCode Mock] postMessage:', message);
      },
      getState: () => undefined,
      setState: <T,>(newState: T) => newState,
    };
    vscodeApiInstance = mockApi;
    return mockApi;
  }
}

/**
 * Provider component that initializes and provides the VS Code API to child components
 */
export function VSCodeProvider({ children }: VSCodeProviderProps) {
  const [vscode, setVscode] = useState<VSCodeAPI | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Use the singleton function to get or acquire the API
    const api = getVSCodeAPI();
    setVscode(api);
    setIsReady(true);
  }, []);

  return (
    <VSCodeContext.Provider value={{ vscode, isReady }}>
      {children}
    </VSCodeContext.Provider>
  );
}

/**
 * Hook to access the VS Code API context
 * @throws Error if used outside of VSCodeProvider
 */
export function useVSCodeContext(): VSCodeContextValue {
  const context = useContext(VSCodeContext);
  if (!context) {
    throw new Error('useVSCodeContext must be used within a VSCodeProvider');
  }
  return context;
}

