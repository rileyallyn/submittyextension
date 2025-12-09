/**
 * Type definitions for VS Code webview API
 */

// VS Code API types
declare global {
  interface Window {
    acquireVsCodeApi?: () => VSCodeAPI;
  }
}

export interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState<T = unknown>(): T | undefined;
  setState<T = unknown>(newState: T): T;
}

/**
 * Base message structure for communication between webview and extension
 */
export interface VSCodeMessage<T = unknown> {
  command: string;
  data?: T;
  [key: string]: unknown;
}

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (message: VSCodeMessage<T>) => void | Promise<void>;

/**
 * Options for useVSCodeMessage hook
 */
export interface UseVSCodeMessageOptions {
  /**
   * If true, the handler will only be called for messages matching the specified command
   */
  command?: string;
  /**
   * If true, the handler will be called immediately with the last received message
   */
  immediate?: boolean;
}

