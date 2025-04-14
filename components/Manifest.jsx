import React, { useCallback, memo } from 'react';
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
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    onDragStart(item, e);
  }, [item, onDragStart]);

  const handleEdit = useCallback((e) => {
    onEdit(item, e.target.value);
  }, [item, onEdit]);

  const handleResize = useCallback((e) => {
    e.stopPropagation();
    onResize(e, item);
  }, [item, onResize]);

  const handleClick = useCallback(() => {
    onActivate(item.id);
  }, [item.id, onActivate]);

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
      <textarea 
        className={styles.input} 
        style={{ cursor: isDragging ? 'grabbing' : 'text' }}
        onChange={handleEdit}
        value={item.text} 
        placeholder="Try adding a to-do"
      />
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