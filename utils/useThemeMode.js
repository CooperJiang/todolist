import { useCallback, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from './storage';
import { THEME, LIGHT, DARK } from '../constants';

const useThemeMode = () => {
  const [themeMode, setThemeMode] = useState(LIGHT);
  const [redrawCanvas, setRedrawCanvas] = useState(0);
  
  // 初始化主题
  const initTheme = useCallback(() => {
    const body = document.querySelector("body");
    const storedTheme = getStorageItem(THEME);
    
    if (storedTheme) {
      if (storedTheme === DARK) {
        body.classList.add(DARK);
        setStorageItem(THEME, DARK);
        setThemeMode(DARK);
      } else {
        body.classList.remove(DARK);
        setStorageItem(THEME, LIGHT);
        setThemeMode(LIGHT);
      }
      return;
    }
    
    // 如果没有存储的主题，则根据系统主题自动设置
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.classList.add(DARK);
      setStorageItem(THEME, DARK);
      setThemeMode(DARK);
    } else {
      setThemeMode(LIGHT);
    }
  }, []);
  
  // 切换主题
  const toggleTheme = useCallback((theme) => {
    const body = document.querySelector("body");
    
    if (!theme) {
      // 手动切换
      const currentTheme = getStorageItem(THEME);
      if (currentTheme === LIGHT) {
        body.classList.add(DARK);
        setStorageItem(THEME, DARK);
        setThemeMode(DARK);
      } else {
        body.classList.remove(DARK);
        setStorageItem(THEME, LIGHT);
        setThemeMode(LIGHT);
      }
    } else {
      // 直接设置为指定主题
      body.classList.remove(DARK); 
      if (theme === DARK) {
        body.classList.add(DARK);
      }
      setStorageItem(THEME, theme);
      setThemeMode(theme);
    }
    
    // 触发Canvas重绘
    setRedrawCanvas(prev => prev + 1);
  }, []);
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 只有当用户没有手动设置主题时才自动切换
      if (!getStorageItem(THEME)) {
        toggleTheme(e.matches ? DARK : LIGHT);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [toggleTheme]);
  
  // 处理键盘快捷键
  const handleThemeShortcut = useCallback((e) => {
    if ((e.code === "KeyC" || e.keyCode === 67) && e.altKey) {
      toggleTheme();
      return true;
    }
    return false;
  }, [toggleTheme]);
  
  return { themeMode, redrawCanvas, initTheme, toggleTheme, handleThemeShortcut };
};

export default useThemeMode; 