import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useCallback } from "react";
import Canvas from "../components/Canvas";
import Manifest from "../components/Manifest";
import useManifestInteractions from "../utils/useManifestInteractions";
import useThemeMode from "../utils/useThemeMode";
import useMessageHandler from "../utils/useMessageHandler";
import { defaultTodo } from '../constants';

export default function Home() {
  const mainRef = useRef(null);
  
  // 使用自定义Hooks
  const { 
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
  } = useManifestInteractions();
  
  const {
    redrawCanvas,
    initTheme,
    toggleTheme,
    handleThemeShortcut
  } = useThemeMode();
  
  // 消息处理
  const { sendThemeChangeMessage } = useMessageHandler(toggleTheme);

  // 初始化
  useEffect(() => {
    initTheme();
    initManifests(defaultTodo);
    
    // 监听键盘事件
    const handleKeydown = (e) => {
      // 处理主题切换快捷键
      if (handleThemeShortcut(e)) {
        sendThemeChangeMessage();
        return;
      }
      
      // 处理清空便签快捷键
      if ((e.code === "KeyR" || e.keyCode === 82) && e.altKey) {
        deleteAllManifests();
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [initTheme, initManifests, handleThemeShortcut, deleteAllManifests, sendThemeChangeMessage]);
  
  // 处理鼠标按下事件（创建新便签）
  const handleMouseDown = useCallback((e) => {
    if (mainRef.current) {
      createManifest(e, mainRef.current);
    }
  }, [createManifest]);
  
  // 处理便签移动
  const handleDragStart = useCallback((manifest, e) => {
    if (mainRef.current) {
      moveManifest(manifest, e, mainRef.current);
    }
  }, [moveManifest]);
  
  // 处理便签大小调整
  const handleResize = useCallback((e, manifest) => {
    if (mainRef.current) {
      resizeManifest(e, manifest, mainRef.current);
    }
  }, [resizeManifest]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Todolist panel</title>
        <meta name="description" content="a quick to-do panel management tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 背景网格 */}
      <Canvas redraw={redrawCanvas} />

      <main 
        className={styles.main} 
        ref={mainRef} 
        id="main" 
        onMouseDown={handleMouseDown}
      >
        {manifestList.map((item) => (
          <Manifest
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            isDragging={isDragging && activeId === item.id}
            onActivate={activateManifest}
            onDelete={deleteManifest}
            onDragStart={handleDragStart}
            onEdit={editManifest}
            onResize={handleResize}
          />
        ))}
      </main>
    </div>
  );
}
