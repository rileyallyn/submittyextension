# VS Code Message API Wrapper

A React wrapper around the VS Code webview message API that follows common React patterns for events and sending messages.

## Features

- ✅ React Context Provider for VS Code API
- ✅ Custom hooks for sending and receiving messages
- ✅ TypeScript support with full type safety
- ✅ Automatic cleanup of event listeners
- ✅ Support for async message handlers
- ✅ Filter messages by command
- ✅ Mock API for development/testing

## Usage

### Setup

The `VSCodeProvider` is already set up in `main.tsx`. Your app is automatically wrapped and ready to use.

### Sending Messages

Use the `useVSCodePostMessage` hook to send messages to the VS Code extension:

```tsx
import { useVSCodePostMessage } from './hooks';

function LoginForm() {
  const postMessage = useVSCodePostMessage();

  const handleLogin = () => {
    postMessage({
      command: 'login',
      data: {
        username: 'user@example.com',
        password: 'password123'
      }
    });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Receiving Messages

Use the `useVSCodeMessage` hook to listen for messages from the VS Code extension:

```tsx
import { useVSCodeMessage } from './hooks';
import { useState, useEffect } from 'react';

function CourseList() {
  const [courses, setCourses] = useState([]);

  // Listen to all messages
  useVSCodeMessage((message) => {
    if (message.command === 'displayCourses') {
      setCourses(message.data?.courses || []);
    }
  });

  // Or filter by specific command
  useVSCodeMessage((message) => {
    setCourses(message.data?.courses || []);
  }, { command: 'displayCourses' });

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

### Advanced Usage

#### Async Message Handlers

The hook supports async handlers:

```tsx
useVSCodeMessage(async (message) => {
  if (message.command === 'fetchData') {
    const data = await processData(message.data);
    // Handle processed data
  }
});
```

#### Immediate Message Handling

Get the last received message immediately when the component mounts:

```tsx
useVSCodeMessage((message) => {
  console.log('Received:', message);
}, { command: 'initialState', immediate: true });
```

#### Accessing VS Code API Directly

If you need direct access to the VS Code API (e.g., for state management):

```tsx
import { useVSCodeContext } from './contexts';

function MyComponent() {
  const { vscode, isReady } = useVSCodeContext();

  useEffect(() => {
    if (isReady && vscode) {
      const state = vscode.getState();
      vscode.setState({ ...state, newKey: 'value' });
    }
  }, [vscode, isReady]);

  return <div>...</div>;
}
```

## Type Safety

All messages are typed. You can extend the base `VSCodeMessage` type for your specific use cases:

```tsx
import type { VSCodeMessage } from './types/vscode';

interface LoginMessage extends VSCodeMessage<{ username: string; password: string }> {
  command: 'login';
}

interface CourseData {
  courses: Array<{ id: string; name: string }>;
}

interface CourseMessage extends VSCodeMessage<CourseData> {
  command: 'displayCourses';
}
```

## API Reference

### `VSCodeProvider`

Context provider that initializes and provides the VS Code API.

**Props:**
- `children: ReactNode` - Child components

### `useVSCodePostMessage()`

Hook for sending messages to the VS Code extension.

**Returns:** `(message: VSCodeMessage) => void`

### `useVSCodeMessage(handler, options?)`

Hook for listening to messages from the VS Code extension.

**Parameters:**
- `handler: MessageHandler<T>` - Function to call when a message is received
- `options?: UseVSCodeMessageOptions` - Optional configuration
  - `command?: string` - Filter messages by command
  - `immediate?: boolean` - Call handler immediately with last message

### `useVSCodeContext()`

Hook to access the VS Code API context directly.

**Returns:** `{ vscode: VSCodeAPI | null, isReady: boolean }`

## Notes

- The wrapper automatically creates a mock API in non-VS Code environments (development)
- Event listeners are automatically cleaned up when components unmount
- The API is ready when `isReady` is `true` in the context

