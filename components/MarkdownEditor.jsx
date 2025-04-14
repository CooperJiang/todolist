import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import styles from '../styles/MarkdownEditor.module.css';

const MarkdownEditor = ({ value, onChange, placeholder, isEditing, onClickOutside }) => {
  // 移除isPreview状态，使用focusedLine来跟踪当前正在编辑的行
  const [focusedLine, setFocusedLine] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(null);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  // 从值中获取行
  const getLines = useCallback(() => {
    return value ? value.split('\n') : [''];
  }, [value]);

  // 处理输入变化
  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        onChange(e.target.value);
      }
      
      // 保存光标位置
      setCursorPosition(e.target.selectionStart);
    },
    [onChange]
  );

  // 将焦点设置在特定行
  const focusOnLine = useCallback((lineIndex) => {
    if (!isEditing) return;
    
    setFocusedLine(lineIndex);
    
    // 让父组件知道我们正在编辑
    if (onClickOutside) {
      onClickOutside(false);
    }
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  }, [isEditing, onClickOutside]);

  // 点击预览内容时进入编辑模式
  const handlePreviewClick = useCallback(() => {
    if (isEditing) {
      focusOnLine(0);
    }
  }, [isEditing, focusOnLine]);

  // 插入Markdown格式化标记
  const insertFormat = useCallback(
    (format) => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      
      let newText = '';
      let newCursorPos = start;
      
      switch(format) {
        case 'bold':
          newText = `**${selectedText}**`;
          newCursorPos = selectedText ? end + 4 : start + 2;
          break;
        case 'italic':
          newText = `*${selectedText}*`;
          newCursorPos = selectedText ? end + 2 : start + 1;
          break;
        case 'strike':
          newText = `~~${selectedText}~~`;
          newCursorPos = selectedText ? end + 4 : start + 2;
          break;
        case 'code':
          newText = `\`${selectedText}\``;
          newCursorPos = selectedText ? end + 2 : start + 1;
          break;
        case 'link':
          newText = `[${selectedText || '链接文本'}](url)`;
          newCursorPos = selectedText ? end + 7 : start + 12;
          break;
        case 'heading':
          // 如果选中了文本，在新行开始添加标题符号
          if (start > 0 && value.charAt(start - 1) !== '\n') {
            newText = `\n# ${selectedText}`;
            newCursorPos = start + 3 + selectedText.length;
          } else {
            newText = `# ${selectedText}`;
            newCursorPos = start + 2 + selectedText.length;
          }
          break;
        case 'list':
          // 如果选中了文本，将每行变成列表项
          if (selectedText.includes('\n')) {
            const lines = selectedText.split('\n');
            newText = lines.map(line => `- ${line}`).join('\n');
            newCursorPos = end + lines.length * 2;
          } else {
            newText = `- ${selectedText}`;
            newCursorPos = start + 2 + selectedText.length;
          }
          break;
        default:
          return;
      }
      
      const updatedValue = 
        value.substring(0, start) + 
        newText + 
        value.substring(end);
      
      onChange(updatedValue);
      
      // 设置新的光标位置
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [value, onChange]
  );

  // 处理快捷键
  const handleKeyDown = useCallback(
    (e) => {
      // Tab键插入两个空格
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newValue = 
          value.substring(0, start) + '  ' + value.substring(end);
        
        onChange(newValue);
        
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2;
            textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
      
      // 更多快捷键
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'b':
            e.preventDefault();
            insertFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            insertFormat('italic');
            break;
          case 'k':
            e.preventDefault();
            insertFormat('link');
            break;
          default:
            break;
        }
      }
      
      // Esc键：完成编辑
      if (e.key === 'Escape') {
        setFocusedLine(-1);
        if (onClickOutside) onClickOutside(true);
      }
    },
    [value, onChange, insertFormat, onClickOutside]
  );
  
  // 点击外部处理
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editorRef.current && !editorRef.current.contains(e.target)) {
        setFocusedLine(-1);
        if (onClickOutside) onClickOutside(true);
      }
    };

    if (isEditing && focusedLine >= 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, focusedLine, onClickOutside]);

  // 自动根据内容调整高度
  useEffect(() => {
    if (textareaRef.current && focusedLine >= 0) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, focusedLine]);
  
  // 当isEditing变为true时，自动进入编辑状态
  useEffect(() => {
    if (isEditing && focusedLine < 0) {
      setFocusedLine(0);
    } else if (!isEditing) {
      setFocusedLine(-1);
    }
  }, [isEditing]);

  return (
    <div 
      className={styles.markdownEditor} 
      ref={editorRef}
    >
      {/* 显示预览，但当focusedLine >= 0时处于编辑模式 */}
      <div 
        className={`${styles.preview} ${focusedLine >= 0 ? styles.editing : ''}`}
        onClick={handlePreviewClick}
        ref={previewRef}
      >
        {value ? (
          <div className={styles.markdown}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {value}
            </ReactMarkdown>
          </div>
        ) : (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
      </div>
      
      {/* 在编辑模式下显示文本框 */}
      {focusedLine >= 0 && (
        <textarea
          ref={textareaRef}
          className={styles.editor}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      )}
      
      {/* 只在编辑状态或悬停时显示格式工具栏 */}
      {isEditing && (
        <div className={`${styles.toolbar} ${styles.editToolbar}`}>
          <div className={styles.formatButtons}>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('bold')}
              title="粗体 (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('italic')}
              title="斜体 (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('strike')}
              title="删除线"
            >
              S
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('code')}
              title="代码"
            >
              {`<>`}
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('link')}
              title="链接 (Ctrl+K)"
            >
              🔗
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('heading')}
              title="标题"
            >
              H
            </button>
            <button
              type="button"
              className={styles.formatButton}
              onClick={() => insertFormat('list')}
              title="列表"
            >
              •
            </button>
          </div>
        </div>
      )}
      
      {/* 提示可以点击编辑 */}
      {isEditing && focusedLine < 0 && (
        <div className={styles.editHintSubtle}>
          点击编辑
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor; 