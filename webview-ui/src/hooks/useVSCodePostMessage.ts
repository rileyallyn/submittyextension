import { useCallback } from 'react';
import { useVSCodeContext } from '../contexts/VSCodeContext';
import type { VSCodeMessage } from '../types/vscode';

/**
 * Hook for sending messages to the VS Code extension
 * 
 * @example
 * ```tsx
 * const postMessage = useVSCodePostMessage();
 * 
 * const handleClick = () => {
 *   postMessage({ command: 'login', data: { username, password } });
 * };
 * ```
 */
export function useVSCodePostMessage() {
  const { vscode, isReady } = useVSCodeContext();

  const postMessage = useCallback(
    <T = unknown>(message: VSCodeMessage<T>) => {
      if (!isReady || !vscode) {
        console.warn('VSCode API is not ready. Message not sent:', message);
        return;
      }

      try {
        vscode.postMessage(message);
      } catch (error) {
        console.error('Error posting message to VS Code:', error);
      }
    },
    [vscode, isReady]
  );

  return postMessage;
}

