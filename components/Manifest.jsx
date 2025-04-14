import React, { useCallback, memo, useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import styles from '../styles/Home.module.css';

const Manifest = ({
  item,
  isActive,
  isDragging,
  onActivate,
  onDelete,
  onDragStart,
  onEdit,
  onResize
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // 当便签被激活时，自动进入编辑模式
  useEffect(() => {
    if (isActive) {
      if (!isDragging) {
        setIsEditing(true);
      }
    } else {
      // 便签失去焦点时，退出编辑模式
      setIsEditing(false);
    }
  }, [isActive, isDragging]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    onDragStart(item, e);
  }, [item, onDragStart]);

  const handleEdit = useCallback((text) => {
    onEdit(item, text);
  }, [item, onEdit]);

  const handleResize = useCallback((e) => {
    e.stopPropagation();
    onResize(e, item);
  }, [item, onResize]);

  const handleClick = useCallback((e) => {
    // 防止点击编辑器内部元素时触发
    if (e.target.closest(`.${styles.contentWrapper}`)) {
      return;
    }
    
    onActivate(item.id);
  }, [item.id, onActivate]);

  // 更新handleClickOutside，根据shouldClose参数决定是否退出编辑
  const handleClickOutside = useCallback((shouldClose = true) => {
    // 如果shouldClose为false，则是要进入编辑模式
    if (!shouldClose) {
      if (isActive) {
        setIsEditing(true);
      }
    } else if (shouldClose) {
      // 退出编辑模式但保持便签激活状态
      // 我们不需要做什么，编辑器会自动从编辑状态变成预览状态
    }
  }, [isActive]);

  return (
    <div
      className={`${styles.manifest} ${isActive ? styles.active : ''}`}
      id={item.id}
      style={{
        width: item.size.width,
        height: item.size.height,
        left: item.position.left,
        top: item.position.top,
        zIndex: item.zIndex
      }}
      onClick={handleClick}
      role="note"
      aria-label="Todo item"
    >
      <div className={`${styles.header} ${isDragging ? styles.header_active : ''}`}>
        <span 
          className={styles.close} 
          onClick={handleDelete}
          role="button"
          aria-label="Delete todo"
        >
          一
        </span>
        <span 
          className={styles.drag} 
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleDragStart}
          role="button"
          aria-label="Move todo"
        >
        </span>
      </div>
      <div className={styles.contentWrapper}>
        <MarkdownEditor
          value={item.text}
          onChange={handleEdit}
          placeholder="点击添加内容 (支持Markdown格式)"
          isEditing={isActive && isEditing}
          onClickOutside={handleClickOutside}
        />
      </div>
      <div 
        className={styles.resize} 
        onMouseDown={handleResize}
        role="button"
        aria-label="Resize todo"
      />
    </div>
  );
};

export default memo(Manifest); 