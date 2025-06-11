import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedPreference = localStorage.getItem('theme');
    // Default to light mode (false) if no preference or if preference is 'light'
    return storedPreference === 'dark';
  });

  useEffect(() => {
    console.log('[ThemeContext] useEffect triggered. isDarkMode:', isDarkMode );
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('[ThemeContext] Added "dark" class to <html>');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('[ThemeContext] Removed "dark" class from <html>');
    }
  }, [isDarkMode]);

//   const toggleTheme = () => setIsDarkMode(prevMode => !prevMode);
    const toggleTheme = () => {
        console.log('[ThemeContext] toggleTheme called.');
        setIsDarkMode(prevMode => {
        const newMode = !prevMode;
        console.log('[ThemeContext] Previous mode:', prevMode, 'New mode:', newMode);
        return newMode;
        });
    };


  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};