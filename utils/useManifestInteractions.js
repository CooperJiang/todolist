import { useState, useCallback } from 'react';
import { getRandomId } from './tools';
import { setStorageItem, getStorageItem } from './storage';
import { TODOLIST } from '../constants';

const useManifestInteractions = (minWidth = 80, minHeight = 80) => {
  const [manifestList, setManifestList] = useState([]);
  const [activeId, setActiveId] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(1000);
  const [cacheCreateItem, setCacheCreateItem] = useState({ 
    position: { left: null, top: null}, 
    size: { width: 0, height: 0 }, 
    zIndex: 0, 
    text: "" 
  });

  // 初始化数据
  const initManifests = useCallback((defaultTodos) => {
    const storageTodos = getStorageItem(TODOLIST) || [];
    const todos = storageTodos.length ? storageTodos : defaultTodos;
    
    if (todos.length) {
      setZIndex(Math.max(...todos.map(t => t.zIndex)) + 1);
    }
    
    setManifestList(todos);
  }, []);

  // 创建便签
  const createManifest = useCallback((e, mainElement) => {
    if (e.target.id !== 'main') return null;
    
    mainElement.style.cursor = "crosshair";
    const mousedownPoint = { x: e.clientX, y: e.clientY };
    
    // 创建临时div用于可视化拖拽过程
    const activeDiv = document.createElement("div");
    activeDiv.id = "createIn";
    activeDiv.style.backgroundColor = `#c4bebe80`;
    activeDiv.style.position = "absolute";
    activeDiv.style.zIndex = "99999"; // 字符串类型
    document.body.appendChild(activeDiv);
    
    const newCacheItem = { 
      position: { left: null, top: null}, 
      size: { width: 0, height: 0 }, 
      zIndex: zIndex, // 数字类型
      text: "" 
    };
    
    // 鼠标移动处理逻辑
    const handleMouseMove = (moveEvent) => {
      const { clientX, clientY } = moveEvent;
      const { x, y } = mousedownPoint;
      const diffX = clientX - x;
      const diffY = clientY - y;
      
      // 计算位置（考虑四个方向的拖拽）
      if (diffX > 0 && diffY > 0) {
        newCacheItem.position = { left: x, top: y };
      } else if (diffX > 0 && diffY < 0) {
        newCacheItem.position = { left: x, top: clientY };
      } else if (diffX < 0 && diffY > 0) {
        newCacheItem.position = { left: clientX, top: y };
      } else if (diffX < 0 && diffY < 0) {
        newCacheItem.position = { left: clientX, top: clientY };
      }
      
      const { left, top } = newCacheItem.position;
      activeDiv.style.left = `${left}px`;
      activeDiv.style.top = `${top}px`;
      activeDiv.style.width = `${Math.abs(diffX)}px`;
      activeDiv.style.height = `${Math.abs(diffY)}px`;
      
      newCacheItem.size = { 
        width: Math.abs(diffX), 
        height: Math.abs(diffY) 
      };
    };
    
    // 鼠标松开处理逻辑
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      mainElement.style.cursor = "pointer";
      const tempDiv = document.getElementById("createIn");
      if (tempDiv) document.body.removeChild(tempDiv);
      
      const { width, height } = newCacheItem.size;
      
      // 检查尺寸是否满足最小要求
      if (width < minWidth || height < minHeight) return;
      
      // 创建新的便签并更新状态
      const id = getRandomId();
      const newManifest = { ...newCacheItem, id };
      
      setManifestList(prev => {
        const updated = [...prev, newManifest];
        setStorageItem(TODOLIST, updated);
        return updated;
      });
      
      setZIndex(prev => prev + 1);
      setActiveId(id);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zIndex, minWidth, minHeight]);

  // 激活便签
  const activateManifest = useCallback((id) => {
    setActiveId(id);
    
    setManifestList(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, zIndex };
        }
        return item;
      });
      
      setStorageItem(TODOLIST, updated);
      return updated;
    });
    
    setZIndex(prev => prev + 1);
  }, [zIndex]);

  // 移动便签
  const moveManifest = useCallback((manifest, e, mainElement) => {
    activateManifest(manifest.id);
    mainElement.style.cursor = "grabbing";
    setIsDragging(true);
    
    const { clientX, clientY } = e;
    const { id, position } = manifest;
    const { left, top } = position;
    const element = document.getElementById(id);
    
    const handleMouseMove = (moveEvent) => {
      const diffX = Math.floor((moveEvent.clientX - clientX) / 10) * 10;
      const diffY = Math.floor((moveEvent.clientY - clientY) / 10) * 10;
      
      let curX = left + diffX;
      let curY = top + diffY;
      
      // 限制在窗口内
      curX = Math.max(0, curX);
      curY = Math.max(0, curY);
      
      const { innerWidth, innerHeight } = window;
      curX = Math.min(innerWidth - minWidth, curX);
      curY = Math.min(innerHeight - minHeight, curY);
      
      element.style.left = `${curX}px`;
      element.style.top = `${curY}px`;
      
      updateManifest(manifest.id, { position: { left: curX, top: curY } });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      mainElement.style.cursor = "pointer";
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activateManifest]);

  // 调整便签大小
  const resizeManifest = useCallback((e, manifest, mainElement) => {
    activateManifest(manifest.id);
    setIsDragging(true);
    mainElement.style.cursor = "nw-resize";
    
    const { clientX, clientY } = e;
    const { id, size } = manifest;
    const { width, height } = size;
    const element = document.getElementById(id);
    
    const handleMouseMove = (moveEvent) => {
      const diffX = moveEvent.clientX - clientX;
      const diffY = moveEvent.clientY - clientY;
      
      const curWidth = Math.floor(Math.max(width + diffX, minWidth) / 10) * 10;
      const curHeight = Math.floor(Math.max(height + diffY, minHeight) / 10) * 10;
      
      element.style.width = `${curWidth}px`;
      element.style.height = `${curHeight}px`;
      
      updateManifest(manifest.id, { size: { width: curWidth, height: curHeight } });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      mainElement.style.cursor = "pointer";
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activateManifest, minWidth, minHeight]);

  // 编辑便签内容
  const editManifest = useCallback((manifest, text) => {
    updateManifest(manifest.id, { text });
  }, []);

  // 删除便签
  const deleteManifest = useCallback((id) => {
    const confirmDelete = window.confirm("确定要删除这个便签吗？");
    if (!confirmDelete) return;
    
    setManifestList(prev => {
      const updated = prev.filter(item => item.id !== id);
      setStorageItem(TODOLIST, updated);
      return updated;
    });
  }, []);

  // 删除所有便签
  const deleteAllManifests = useCallback(() => {
    const confirmDelete = window.confirm("确定要删除所有便签吗？");
    if (!confirmDelete) return;
    
    setManifestList([]);
    setStorageItem(TODOLIST, []);
  }, []);

  // 更新便签数据
  const updateManifest = useCallback((id, changes) => {
    setManifestList(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, ...changes };
        }
        return item;
      });
      
      setStorageItem(TODOLIST, updated);
      return updated;
    });
  }, []);

  return {
    manifestList,
    activeId,
    isDragging,
    initManifests,
    createManifest,
    activateManifest,
    moveManifest,
    resizeManifest,
    editManifest,
    deleteManifest,
    deleteAllManifests
  };
};

export default useManifestInteractions; 