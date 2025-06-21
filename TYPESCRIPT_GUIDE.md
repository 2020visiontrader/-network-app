# TypeScript Guide for NetworkFounderApp

This guide explains how to work with TypeScript in the NetworkFounderApp project.

## Migration Progress Update

As of June 21, 2025, we have:

- ✅ Converted all JavaScript files in `src/` to TypeScript
- ✅ Added initial type definitions and interfaces
- ✅ Created type checking scripts and workflows
- ✅ Fixed major TypeScript errors
- ✅ Created common type definitions in `src/types/`
- ✅ Configured tsconfig.json to exclude backup/legacy files

### Next Steps

- 🔄 Continue adding more specific types to improve type coverage
- 🔄 Test the application to ensure functionality is preserved
- 🔄 Update documentation to reflect TypeScript usage

## Working with TypeScript in NetworkFounderApp

### TypeScript Scripts

We have several scripts to help with TypeScript:

```bash
# Check for TypeScript errors
./check-typescript.sh

# Fix common TypeScript issues
./fix-typescript-issues.sh

# Continue TypeScript migration
./continue-typescript-migration.sh
```

## Table of Contents

1. [Converting JavaScript to TypeScript](#converting-javascript-to-typescript)
2. [Basic TypeScript Patterns](#basic-typescript-patterns)
3. [React Component Typing](#react-component-typing)
4. [Common Types in React Native](#common-types-in-react-native)
5. [Troubleshooting](#troubleshooting)

## Converting JavaScript to TypeScript

We've provided a script to help convert JavaScript files to TypeScript:

```bash
./convert-to-typescript.sh
```

This script will:
- Convert React component files (.js → .tsx)
- Convert other JavaScript files (.js → .ts)
- Create backups of all converted files

After running the script, you'll need to manually add type annotations to your files.

## Basic TypeScript Patterns

### Variables

```typescript
// Simple types
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;

// Arrays
const users: string[] = ['Alice', 'Bob'];
const scores: Array<number> = [85, 92, 78];

// Objects
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional property
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};
```

### Functions

```typescript
// Function with typed parameters and return value
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function with typed parameters and return value
const multiply = (a: number, b: number): number => a * b;

// Function with optional parameter
function greet(name: string, title?: string): string {
  if (title) {
    return `Hello, ${title} ${name}!`;
  }
  return `Hello, ${name}!`;
}

// Function with default parameter
function createUser(name: string, role: string = 'user'): User {
  // Implementation
}
```

## React Component Typing

### Functional Components

```typescript
import React from 'react';
import { Text, View } from 'react-native';

// Simple props interface
interface GreetingProps {
  name: string;
  isLoggedIn?: boolean;
}

// Functional component with typed props
const Greeting: React.FC<GreetingProps> = ({ name, isLoggedIn = false }) => {
  return (
    <View>
      <Text>{isLoggedIn ? `Hello, ${name}!` : 'Please log in'}</Text>
    </View>
  );
};

export default Greeting;
```

### Class Components

```typescript
import React, { Component } from 'react';
import { Text, View } from 'react-native';

interface CounterProps {
  initialCount: number;
}

interface CounterState {
  count: number;
}

class Counter extends Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount
    };
  }

  increment = (): void => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  render() {
    return (
      <View>
        <Text>Count: {this.state.count}</Text>
        <Button title="Increment" onPress={this.increment} />
      </View>
    );
  }
}

export default Counter;
```

## Common Types in React Native

### Event Handlers

```typescript
import { GestureResponderEvent, TextInputChangeEventData, NativeSyntheticEvent } from 'react-native';

// Button press handler
const handlePress = (event: GestureResponderEvent): void => {
  console.log('Button pressed');
};

// Text input change handler
const handleChange = (event: NativeSyntheticEvent<TextInputChangeEventData>): void => {
  console.log('Text changed', event.nativeEvent.text);
};

// Or with the simpler onChangeText prop
const handleChangeText = (text: string): void => {
  console.log('Text changed', text);
};
```

### Navigation

```typescript
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Define your stack parameter list
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

// Navigation props for a specific screen
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, route }) => {
  // Access the userId parameter
  const { userId } = route.params;
  
  // Navigate to another screen
  const goToSettings = () => {
    navigation.navigate('Settings');
  };
  
  return (
    // Your component implementation
  );
};
```

## Troubleshooting

### Type Checking

To check for type errors in your project:

```bash
npx tsc --noEmit
```

### Common Errors

#### Property 'X' does not exist on type 'Y'

This error occurs when you're trying to access a property that TypeScript doesn't know exists on an object.

Solution: Define the property in the interface or type, or use optional chaining:

```typescript
// Using optional chaining
const name = user?.profile?.name;

// Or properly type the object
interface User {
  profile?: {
    name: string;
  };
}
```

#### Cannot find module 'X' or its corresponding type declarations

This error occurs when TypeScript can't find type definitions for a module.

Solution: Install the appropriate @types package:

```bash
npm install --save-dev @types/module-name
```

For custom modules, create a declaration file:

```typescript
// src/types/custom-module.d.ts
declare module 'custom-module' {
  export function doSomething(): void;
  // Define other exports
}
```
