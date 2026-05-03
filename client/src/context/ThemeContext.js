import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'dark', 'light', 'custom'
  const [customColor, setCustomColor] = useState('#3b82f6'); // default tailwind blue-500

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('customColor') || '#3b82f6';
    setTheme(savedTheme);
    setCustomColor(savedColor);
    applyTheme(savedTheme, savedColor);
  }, []);

  const applyTheme = (currentTheme, color) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'custom-theme');
    
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.style.removeProperty('--primary-color');
    } else if (currentTheme === 'light') {
      root.classList.add('light');
      root.style.removeProperty('--primary-color');
    } else if (currentTheme === 'custom') {
      root.classList.add('custom-theme', 'dark'); // Use dark mode base for custom theme
      root.style.setProperty('--primary-color', color);
    }
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, customColor);
  };

  const changeCustomColor = (color) => {
    setCustomColor(color);
    localStorage.setItem('customColor', color);
    if (theme === 'custom') {
      applyTheme('custom', color);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, customColor, changeTheme, changeCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
