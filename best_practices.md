# React.js Code Standards and Best Practices

This document outlines the code standards and best practices for the TshirtDeals React.js frontend codebase. All pull requests must adhere to these standards.

## Table of Contents

1. [Proper Title and Description](#1-proper-title-and-description)
2. [Single Responsibility](#2-single-responsibility)
3. [Readme File](#3-readme-file)
4. [Environment Variables](#4-environment-variables)
5. [MVC Pattern](#5-mvc-pattern)
6. [Shy Code](#6-shy-code)
7. [SOLID Principle](#7-solid-principle)
8. [DRY Principle](#8-dry-principle)
9. [Naming Conventions](#9-naming-conventions)
10. [Comments](#10-comments)
11. [Unnecessary Code and Imports](#11-unnecessary-code-and-imports)
12. [Proper Response Code with Error Message](#12-proper-response-code-with-error-message)
13. [Styling](#13-styling)
14. [Reusability](#14-reusability)
15. [Naming Convention - React Components](#15-naming-convention---react-components)
16. [Routing](#16-routing)
17. [State Management](#17-state-management)

---

## 1. Proper Title and Description

**Weight: 5.00%**

### Requirements

-   **Title**: Make a self-explanatory title describing what the pull request does
-   **Description**: Should be detailed with:
    -   **What** was changed
    -   **Why** it was changed
    -   **How** it was changed

### Example

```markdown
Title: Add user authentication with login form

Description:
- What: Added login form component with email/password validation
- Why: Users need to authenticate before accessing protected routes
- How: Created LoginForm component using React Hook Form, integrated with Redux for auth state
```

---

## 2. Single Responsibility

**Weight: 5.00%**

### Requirements

-   PR should be single responsible, targeting a single feature
-   Multiple features in a single PR increase complexity and reduce code quality

### Guidelines

-   One feature per PR
-   If a feature has multiple sub-features, break them into separate PRs
-   Related bug fixes can be included if they're part of the same feature

---

## 3. Readme File

**Weight: 4.00%**

### Requirements

-   README file should be updated with the new feature
-   Document new components, hooks, utilities, or setup instructions

### Guidelines

-   Update README.md when adding:
    -   New React components
    -   New hooks or utilities
    -   New environment variables
    -   New dependencies
    -   New features that require documentation
    -   Changes to setup/installation process
    -   New routing configurations

---

## 4. Environment Variables

**Weight: 5.00%**

### Requirements

-   Every configuration value should be in environment or config files
-   No code changes required when configuration changes

### Guidelines

-   Store all configuration in:
    -   `.env` file for environment-specific values
    -   `.env.local` for local development overrides
    -   `configs/` directory for configuration modules
-   Never hardcode:
    -   API endpoints
    -   API keys
    -   URLs
    -   Feature flags
    -   Any value that might change between environments

### Example

```javascript
// ❌ Bad
const API_URL = 'https://api.example.com';

// ✅ Good
const API_URL = import.meta.env.VITE_API_URL;
```

---

## 5. MVC Pattern

**Weight: 4.00%**

### Requirements

-   Follow proper Model, View, and Controller structure in React components
-   Separate presentation logic from business logic

### Architecture in React

```
View (Components) → Controller (Hooks/Utils) → Model (Redux/State)
```

### Guidelines

-   **View (Components)**: Handle UI rendering and user interactions only
-   **Controller (Hooks/Utils)**: Contain business logic, data transformation, and API calls
-   **Model (Redux/State)**: Manage application state and data

### Example

```javascript
// View Component
const UserProfile = () => {
    const { user, loading } = useUserProfile(); // Controller
    return <div>{user?.name}</div>; // View
};

// Controller Hook
const useUserProfile = () => {
    const user = useSelector(state => state.user); // Model
    // Business logic here
    return { user, loading };
};
```

---

## 6. Shy Code

**Weight: 5.00%**

### Requirements

-   Code should be very less coupled with other code
-   Maximum 23 lines are allowed in a function

### Guidelines

-   Keep functions small and focused
-   Extract complex logic into separate functions
-   Reduce dependencies between modules
-   Use dependency injection where possible
-   Prefer composition over inheritance

### Example

```javascript
// ❌ Bad - Too long and tightly coupled
const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const validated = validateForm(data);
    if (!validated.isValid) {
        setErrors(validated.errors);
        return;
    }
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            navigate('/dashboard');
        }
    } catch (error) {
        console.error(error);
    }
};

// ✅ Good - Split into smaller functions
const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = extractFormData(e.target);
    const validation = validateFormData(formData);
    if (!validation.isValid) {
        setErrors(validation.errors);
        return;
    }
    await submitUserData(formData);
};

const extractFormData = (form) => {
    return Object.fromEntries(new FormData(form));
};

const submitUserData = async (data) => {
    const result = await api.createUser(data);
    if (result.success) navigate('/dashboard');
};
```

---

## 7. SOLID Principle

**Weight: 5.00%**

### Requirements

-   Each function or class should be responsible to handle only one feature
-   If there is any new feature, move it to a new function or class

### SOLID Principles in React

1. **Single Responsibility**: One component/function = one reason to change
2. **Open/Closed**: Open for extension, closed for modification (use composition)
3. **Liskov Substitution**: Components should be substitutable
4. **Interface Segregation**: Prefer specific props over generic ones
5. **Dependency Inversion**: Depend on abstractions (props/interfaces), not concretions

### Example

```javascript
// ❌ Bad - Multiple responsibilities
const UserCard = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const handleEdit = () => { /* ... */ };
    const handleDelete = () => { /* ... */ };
    const handleSave = () => { /* ... */ };
    return <div>{/* Complex UI */}</div>;
};

// ✅ Good - Single responsibility
const UserCard = ({ user, onEdit, onDelete }) => {
    return <div>{/* UI only */}</div>;
};

const useUserActions = (userId) => {
    const handleEdit = () => { /* ... */ };
    const handleDelete = () => { /* ... */ };
    return { handleEdit, handleDelete };
};
```

---

## 8. DRY Principle

**Weight: 5.00%**

### Requirements

-   Don't repeat yourself
-   Write code efficiently so that you can reuse your own logic

### Guidelines

-   Extract common logic into reusable functions
-   Create utility functions for repeated operations
-   Use custom hooks for shared component logic
-   Create reusable components for repeated UI patterns
-   Avoid copy-pasting code

### Example

```javascript
// ❌ Bad - Repeated code
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            });
    }, []);
    // ...
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, []);
    // ...
};

// ✅ Good - Reusable hook
const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            });
    }, [url]);
    return { data, loading };
};

const UserList = () => {
    const { data: users, loading } = useFetch('/api/users');
    // ...
};
```

---

## 9. Naming Conventions

**Weight: 5.00%**

### Requirements

-   Variable names should be according to standards of MERN stack
-   Names should be self-explanatory

### MERN Stack Naming Conventions

-   **Variables & Functions**: `camelCase`

    ```javascript
    const userName = 'John';
    const getUserById = async (id) => {
        /* ... */
    };
    ```

-   **Constants**: `UPPER_SNAKE_CASE`

    ```javascript
    const MAX_RETRY_ATTEMPTS = 3;
    const API_BASE_URL = 'https://api.example.com';
    ```

-   **Classes & Constructors**: `PascalCase`

    ```javascript
    class UserService {}
    const userService = new UserService();
    ```

-   **Files**: `camelCase.js` for modules, `PascalCase.jsx` for React components

    ```javascript
    // userService.js
    // UserProfile.jsx (React component)
    ```

---

## 10. Comments

**Weight: 4.00%**

### Requirements

-   Use TODO comments for remaining tasks in a feature
-   Write comments before each function to describe its functionality

### Guidelines

-   Function comments should explain:
    -   What the function does
    -   Parameters and their types
    -   Return value
    -   Any side effects

### Example

```javascript
/**
 * Fetches user data from the API and updates Redux store
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<Object>} The user data object
 * @throws {Error} If the API request fails
 */
const fetchUserData = async (userId) => {
    // TODO: Add caching mechanism to reduce API calls
    // ...
};
```

---

## 11. Unnecessary Code and Imports

**Weight: 4.00%**

### Requirements

-   Remove unused code and commented code before PR
-   Remove any test console logs

### Guidelines

-   Before committing:
    -   Remove all `console.log()` statements
    -   Remove commented-out code blocks
    -   Remove unused imports
    -   Remove dead code paths
    -   Use ESLint to detect unused imports

### Example

```javascript
// ❌ Bad
import { useState, useEffect, useMemo } from 'react'; // useMemo not used
// const oldFunction = () => { /* ... */ }; // Commented code
console.log('Debug:', data); // Test log

// ✅ Good
import { useState, useEffect } from 'react';
```

---

## 12. Proper Response Code with Error Message

**Weight: 4.00%**

### Requirements

-   Proper responses and error handling in API calls
-   Exception handling and cleanup (dispose) resources
-   Complete error messages for user feedback

### Guidelines

-   Always handle API errors with try/catch
-   Provide meaningful error messages to users
-   Clean up resources (cancel requests, clear timeouts)
-   Use proper error boundaries for React components
-   Handle loading and error states

### Example

```javascript
// ✅ Good
const useApiCall = (url) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        
        const fetchData = async () => {
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'An error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            controller.abort(); // Cleanup
        };
    }, [url]);

    return { data, error, loading };
};
```

---

## 13. Styling

**Weight: 5.00%**

### Requirements

1. Class names should be in snake_case (e.g., `section-wrapper`)
2. Two classes cannot share the same style
3. Use CSS variables for standard colors and font styles
4. Inline styling is prohibited except for dynamic styling

### Guidelines

-   **Class Naming**: Always use `snake_case`

    ```css
    /* ✅ Good */
    .user_profile_card { }
    .navigation_menu { }
    .submit_button { }

    /* ❌ Bad */
    .userProfileCard { }
    .navigation-menu { }
    ```

-   **No Duplicate Styles**: Each class should have unique styles

    ```css
    /* ❌ Bad */
    .button-primary { color: blue; }
    .button-secondary { color: blue; } /* Duplicate */

    /* ✅ Good */
    .button-primary { color: var(--primary-color); }
    .button-secondary { color: var(--secondary-color); }
    ```

-   **CSS Variables**: Use for standard values

    ```css
    /* ✅ Good */
    :root {
        --primary-color: #007bff;
        --font-size-base: 16px;
        --font-family-main: 'Inter', sans-serif;
    }

    .button {
        background-color: var(--primary-color);
        font-size: var(--font-size-base);
        font-family: var(--font-family-main);
    }
    ```

-   **Inline Styles**: Only for dynamic values

    ```javascript
    // ❌ Bad - Static styling
    <div style={{ color: 'blue', fontSize: '16px' }}>Content</div>

    // ✅ Good - Dynamic styling
    <div style={{ 
        transform: `translateX(${offset}px)`,
        opacity: isVisible ? 1 : 0 
    }}>Content</div>
    ```

---

## 14. Reusability

**Weight: 5.00%**

### Requirements

1. If same code in a component repeats more than once, make it a separate component
2. Use utility functions for similar tasks
3. Use HOC (Higher Order Components) for reusability of tasks

### Guidelines

-   **Component Extraction**: Extract repeated JSX into components

    ```javascript
    // ❌ Bad - Repeated code
    const UserList = () => (
        <div>
            <div className="user_card">
                <h3>John Doe</h3>
                <p>john@example.com</p>
            </div>
            <div className="user_card">
                <h3>Jane Smith</h3>
                <p>jane@example.com</p>
            </div>
        </div>
    );

    // ✅ Good - Reusable component
    const UserCard = ({ name, email }) => (
        <div className="user_card">
            <h3>{name}</h3>
            <p>{email}</p>
        </div>
    );

    const UserList = ({ users }) => (
        <div>
            {users.map(user => (
                <UserCard key={user.id} name={user.name} email={user.email} />
            ))}
        </div>
    );
    ```

-   **Utility Functions**: Extract common logic

    ```javascript
    // utils/formatUtils.js
    export const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    export const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US').format(new Date(date));
    };
    ```

-   **Higher Order Components (HOC)**: For cross-cutting concerns

    ```javascript
    // HOC for authentication
    const withAuth = (Component) => {
        return (props) => {
            const { isAuthenticated } = useAuth();
            if (!isAuthenticated) {
                return <Navigate to="/login" />;
            }
            return <Component {...props} />;
        };
    };

    // Usage
    const ProtectedDashboard = withAuth(Dashboard);
    ```

---

## 15. Naming Convention - React Components

**Weight: 5.00%**

### Requirements

1. Use PascalCase for React components and their filenames
2. Use camelCase for component instances

### Guidelines

-   **Component Names**: Always use `PascalCase`

    ```javascript
    // ✅ Good
    const UserProfile = () => { /* ... */ };
    const NavigationMenu = () => { /* ... */ };
    const SubmitButton = () => { /* ... */ };

    // ❌ Bad
    const userProfile = () => { /* ... */ };
    const navigation-menu = () => { /* ... */ };
    ```

-   **File Names**: Match component name

    ```javascript
    // ✅ Good
    // UserProfile.jsx
    export const UserProfile = () => { /* ... */ };

    // ❌ Bad
    // userProfile.jsx
    export const UserProfile = () => { /* ... */ };
    ```

-   **Component Instances**: Use `camelCase`

    ```javascript
    // ✅ Good
    const userProfile = <UserProfile />;
    const navigationMenu = <NavigationMenu />;

    // ❌ Bad
    const UserProfile = <UserProfile />;
    const NavigationMenu = <NavigationMenu />;
    ```

---

## 16. Routing

**Weight: 5.00%**

### Requirements

1. Handle 404 Error properly
2. Authenticated routes cannot be accessible without authentication
3. Use HOC to protect secret routes
4. Use standard naming convention for routing

### Guidelines

-   **404 Error Handling**: Create a NotFound component

    ```javascript
    // routes.jsx
    import { Routes, Route } from 'react-router-dom';
    import NotFound from './components/NotFound';

    const AppRoutes = () => (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} /> {/* 404 handler */}
        </Routes>
    );
    ```

-   **Protected Routes**: Use HOC or component wrapper

    ```javascript
    // ProtectedRoute.jsx
    const ProtectedRoute = ({ children }) => {
        const { isAuthenticated } = useAuth();
        
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        
        return children;
    };

    // Usage
    <Route 
        path="/dashboard" 
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        } 
    />
    ```

-   **Route Naming**: Use kebab-case or camelCase consistently

    ```javascript
    // ✅ Good
    <Route path="/user-profile" element={<UserProfile />} />
    <Route path="/userProfile" element={<UserProfile />} />

    // ❌ Bad
    <Route path="/user_profile" element={<UserProfile />} />
    <Route path="/UserProfile" element={<UserProfile />} />
    ```

---

## 17. State Management

**Weight: 5.00%**

### Requirements

-   Integrate redux-toolkit for state management tool

### Guidelines

-   Use Redux Toolkit for global state management
-   Follow Redux Toolkit best practices:
    -   Use `createSlice` for reducers
    -   Use `createAsyncThunk` for async operations
    -   Use `configureStore` for store setup
    -   Use typed hooks (`useSelector`, `useDispatch`)

### Example

```javascript
// store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (userId) => {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        loading: false,
        error: null
    },
    reducers: {
        clearUser: (state) => {
            state.data = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

---

## Compliance Scoring

Each standard has a weight percentage. PRs are evaluated based on compliance with these standards:

-   **0 Violations**: Score > 4.0
-   **1-3 Violations**: Score 3.0 - 3.99
-   **4-6 Violations**: Score 1.0 - 2.99
-   **6+ Violations**: Score 0

Ensure your PR adheres to all standards to maintain high code quality.
