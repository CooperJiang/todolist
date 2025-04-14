import React, { useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import { LIGHT, DARK, THEME } from '../constants';
import { getStorageItem } from '../utils/storage';

const Canvas = ({ redraw }) => {
  const cvsRef = useRef(null);
  
  const drawPoint = (ctx, { x, y }, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, 1, 1);
    ctx.fill();
  };
  
  const draw = () => {
    if (!cvsRef.current) return;
    
    const { innerWidth, innerHeight } = window;
    cvsRef.current.width = innerWidth - 50;
    cvsRef.current.height = innerHeight - 50;
    
    const ctx = cvsRef.current.getContext("2d");
    const [width, height] = [cvsRef.current.width, cvsRef.current.height];
    const singel = 10;
    const wCount = Math.floor(width / singel);
    const hCount = Math.floor(height / singel);
    const theme = getStorageItem(THEME) || LIGHT;
    const color = theme === LIGHT ? "#00000080" : "#ffffff66";
    
    for (let i = 0; i < hCount; i++) {
      for (let j = 0; j < wCount; j++) {
        drawPoint(ctx, { x: j * singel + 1, y: i * singel + 1 }, color);
      }
    }
  };
  
  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, []);
  
  useEffect(() => {
    draw();
  }, [redraw]);
  
  return <canvas className={styles.canvas} ref={cvsRef} />;
};

export default Canvas; 