import { useEffect, useRef } from 'react';
import { useVSCodeContext } from '../contexts/VSCodeContext';
import type { MessageHandler, UseVSCodeMessageOptions, VSCodeMessage } from '../types/vscode';

/**
 * Hook for listening to messages from the VS Code extension
 * 
 * @param handler - Function to call when a message is received
 * @param options - Optional configuration for message handling
 * 
 * @example
 * ```tsx
 * // Listen to all messages
 * useVSCodeMessage((message) => {
 *   console.log('Received:', message);
 * });
 * 
 * // Listen to specific command
 * useVSCodeMessage((message) => {
 *   console.log('Login success:', message.data);
 * }, { command: 'loginSuccess' });
 * ```
 */
export function useVSCodeMessage<T = unknown>(
  handler: MessageHandler<T>,
  options: UseVSCodeMessageOptions = {}
) {
  const { isReady } = useVSCodeContext();
  const handlerRef = useRef(handler);
  const lastMessageRef = useRef<VSCodeMessage<T> | null>(null);

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const messageHandler = (event: MessageEvent<VSCodeMessage<T>>) => {
      const message = event.data;

      // Filter by command if specified
      if (options.command && message.command !== options.command) {
        return;
      }

      // Store last message for immediate option
      lastMessageRef.current = message;

      // Call the handler
      const result = handlerRef.current(message);
      
      // Handle async handlers
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error('Error in message handler:', error);
        });
      }
    };

    window.addEventListener('message', messageHandler);

    // If immediate option is set and we have a last message, call handler immediately
    if (options.immediate && lastMessageRef.current) {
      const result = handlerRef.current(lastMessageRef.current);
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error('Error in immediate message handler:', error);
        });
      }
    }

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [isReady, options.command, options.immediate]);
}

