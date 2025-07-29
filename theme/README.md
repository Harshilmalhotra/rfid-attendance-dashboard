# Theme System Documentation

## Overview
This application uses a centralized theme configuration that integrates with Tailwind CSS to provide consistent theming across the entire application.

## Theme Structure

### Colors
The theme supports both light and dark modes with the following color categories:

- **Background**: Primary, secondary, and tertiary background colors
- **Foreground**: Primary, secondary, and tertiary text colors
- **Primary**: Brand colors with shades from 50-900
- **Secondary**: Neutral colors with shades from 50-900
- **Success/Warning/Error/Info**: Semantic colors with light, default, and dark variants

### Usage Examples

#### Background Colors
```jsx
// Light mode
<div className="bg-light-background-primary">Primary background</div>
<div className="bg-light-background-secondary">Secondary background</div>

// Dark mode support
<div className="bg-light-background-primary dark:bg-dark-background-primary">
  Responsive background
</div>
```

#### Text Colors
```jsx
// Light mode
<p className="text-light-foreground-primary">Primary text</p>
<p className="text-light-foreground-secondary">Secondary text</p>

// Dark mode support
<p className="text-light-foreground-primary dark:text-dark-foreground-primary">
  Responsive text
</p>
```

#### Primary Colors
```jsx
// Using primary colors
<button className="bg-light-primary-500 hover:bg-light-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-400">
  Primary Button
</button>

// Using color shades
<div className="bg-light-primary-100">Light shade</div>
<div className="bg-light-primary-900">Dark shade</div>
```

#### Semantic Colors
```jsx
// Success
<div className="text-light-success-DEFAULT dark:text-dark-success-DEFAULT">Success message</div>

// Error
<div className="bg-light-error-light dark:bg-dark-error-light">Error background</div>

// Warning
<div className="border-light-warning-DEFAULT dark:border-dark-warning-DEFAULT">Warning border</div>
```

### Other Theme Properties

#### Spacing
```jsx
<div className="p-xs">Extra small padding (0.25rem)</div>
<div className="m-sm">Small margin (0.5rem)</div>
<div className="p-md">Medium padding (1rem)</div>
<div className="m-lg">Large margin (1.5rem)</div>
```

#### Border Radius
```jsx
<div className="rounded-sm">Small radius</div>
<div className="rounded-md">Medium radius</div>
<div className="rounded-lg">Large radius</div>
<div className="rounded-full">Full radius</div>
```

#### Shadows
```jsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
<div className="shadow-xl">Extra large shadow</div>
```

## Theme Provider Integration

The application uses a `ThemeProvider` that manages the theme state and persists the user's preference:

```jsx
// In your root layout
import { ThemeProvider } from '@/context/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Using the Theme Hook

```jsx
import { useTheme } from '@/context/ThemeProvider'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

## Modifying the Theme

To modify the theme, edit the `/theme/config.js` file. All changes will automatically be reflected throughout the application.

Example of adding a new color:
```js
// In theme/config.js
const theme = {
  colors: {
    light: {
      // ... existing colors
      accent: {
        light: '#8b5cf6',
        DEFAULT: '#7c3aed',
        dark: '#6d28d9'
      }
    },
    dark: {
      // ... existing colors
      accent: {
        light: '#a78bfa',
        DEFAULT: '#8b5cf6',
        dark: '#7c3aed'
      }
    }
  }
  // ... rest of theme
}
```

Then use it in your components:
```jsx
<div className="bg-light-accent-DEFAULT dark:bg-dark-accent-DEFAULT">
  Accent color
</div>
```