'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

import { Button } from '@repo/ui';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // We need to wait for the theme to be loaded before rendering the button
  // to avoid hydration mismatch between server and client.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder or null on the server/initial client render
    return (
      <Button variant="outline" size="icon" disabled className="h-10 w-10" />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
