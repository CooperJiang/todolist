import { useEffect, useCallback, useRef } from 'react';
import { getStorageItem } from './storage';
import { THEME, DARK, LIGHT } from '../constants';

const useMessageHandler = (onThemeChange) => {
  const sendMessageRef = useRef(null);

  // 处理接收到的消息
  const handleMessage = useCallback((event) => {
    const { type, data } = event.data;
    
    if (type !== 'theme') return;
    
    const theme = data === 'dark' ? DARK : LIGHT;
    onThemeChange(theme);
    
    // 保存发送消息的函数
    sendMessageRef.current = (message) => {
      event.source.postMessage(message, event.origin);
    };
  }, [onThemeChange]);

  // 发送主题变更消息
  const sendThemeChangeMessage = useCallback(() => {
    if (sendMessageRef.current) {
      const currentTheme = getStorageItem(THEME);
      sendMessageRef.current({ 
        type: 'theme', 
        data: currentTheme === DARK ? 'light' : 'dark' 
      });
    }
  }, []);

  // 监听消息事件
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return { sendThemeChangeMessage };
};

export default useMessageHandler; 