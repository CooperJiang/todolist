import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {getRandomId} from '../utils/tools'

export default function Home() {
  const cvsRef = useRef();
  const mainRef = useRef();
  let [ctx] = useState(null);
  let [isMouseDown] = useState(false);
  let [isDragDown] = useState(false);
  let [mousedownPoint] = useState({ x: 0, y: 0 });
  let [manifestList, setManifestList] = useState([]);
  let [cacheCreateManifestItem] = useState([{ x: 0,y: 0, width: 0,height: 0,left: null, right: null, top: null, bottom: null }]);
  let [initZIndex, setZIndex] = useState(1000)

  useEffect(() => {
    draw();
    watchWindow();
    createManifest();
  }, []);

  /* 绘制背景 */
  function draw() {
    const { innerWidth, innerHeight } = window;
    cvsRef.current.width = innerWidth - 50;
    cvsRef.current.height = innerHeight - 50;
    ctx = cvsRef.current.getContext("2d");
    const [width, height] = [cvsRef.current.width, cvsRef.current.height];
    const singel = 10;
    const wCount = Math.floor(width / singel);
    const hCount = Math.floor(height / singel);
    for (let i = 0; i < hCount; i++) {
      for (let j = 0; j < wCount; j++) {
        drawPoint({ x: j * singel + 1, y: i * singel + 1 });
      }
    }
  }

  /* 绘制点 */
  function drawPoint({ x, y }) {
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "#ddd";
    ctx.fill();
  }

  /* 监听窗口变化 */
  function watchWindow() {
    window.onresize = () => draw();
  }

  /* 点击便签 */
  function hanlderClickManifest(event){
    event.nativeEvent.stopImmediatePropagation()
    event.stopPropagation()
    event.preventDefault()
  }

  /* 创建盒子 */
  function createManifest() {
    const main = document.getElementById('main')
    main.onmousedown = (e) => {
      if(e.target.id !== 'main') return;
      ({ clientX: mousedownPoint.x, clientY: mousedownPoint.y } = e);
      const { x, y } = mousedownPoint;
      isMouseDown = true;
      const activeDiv = document.createElement("div");
      activeDiv.id = "createIn";
      activeDiv.style.backgroundColor = `#c4bebe80`;
      activeDiv.style.position = "absolute";
      activeDiv.style.zIndex = 99999;
      mainRef.current.style.cursor = "crosshair";
      document.body.appendChild(activeDiv);
    };

    main.onmousemove = (e) => {
      if (isMouseDown) {
        const { clientX, clientY } = e;
        const { x, y } = mousedownPoint;
        const activeDiv = document.getElementById("createIn");
        /* 判断鼠标方向确定定位方向  左右*/
        if (clientX - x < 0) {
          activeDiv.style.left = null;
          activeDiv.style.right = `${window.innerWidth - x}px`;
          Object.assign(cacheCreateManifestItem, {left: null, right: window.innerWidth - x })
        } else {
          activeDiv.style.left = `${x}px`;
          activeDiv.style.right = null;
          Object.assign(cacheCreateManifestItem, {left: x, right: null })
        }
        /* 上下 */
        if (clientY - y < 0) {
          activeDiv.style.top = null;
          activeDiv.style.bottom = `${window.innerHeight - y}px`;
          Object.assign(cacheCreateManifestItem, {top: null, bottom: window.innerHeight - y })
        } else {
          activeDiv.style.top = `${y}px`;
          activeDiv.style.bottom = null;
          Object.assign(cacheCreateManifestItem, {top: y, bottom: null })
        }
        activeDiv.style.width = `${Math.abs(x - clientX)}px`;
        activeDiv.style.height = `${Math.abs(y - clientY)}px`;
        Object.assign(cacheCreateManifestItem, {width: Math.abs(x - clientX), height: Math.abs(y - clientY) })
      }
    };

    /* 抬起鼠标， */
    document.onmouseup = (e) => {
      isDragDown = false
      if(!isMouseDown) return
      const activeDiv = document.getElementById("createIn");
      if(!activeDiv) return
      document.body.removeChild(activeDiv)
      isMouseDown = false;
      const { width, height } = cacheCreateManifestItem
      if( width < 80 || height < 80) return;
      const id = getRandomId()
      const newData = manifestList.concat([{...cacheCreateManifestItem,id, zIndex: initZIndex}])
      console.log('initZIndex: ', initZIndex);
      manifestList = newData
      initZIndex++
      console.log('newData: ', newData);
      newData.length && setManifestList(newData)
      /* 初始化cacheCreateManifestItem */
      cacheCreateManifestItem.width = 0
      cacheCreateManifestItem.height = 0
      mainRef.current.style.cursor = "pointer";
    };
  }

  function hanlderManifestMouseDown(manifest, e){
    console.log('manifest: ', manifest);
    const { clientX, clientY } = e;
    isDragDown = true
    const { id, left, right, top, bottom } = manifest
    const mani = document.getElementById(id)
    const drag = document.getElementById('drag')
    e.target.onmousemove = (e) => {
      if(!isDragDown) return
      const diffX = e.clientX - clientX
      const diffY = e.clientY - clientY
      console.log(diffX,diffY,'====',left + diffX);
      if(left > 0){
        main.style.left = `${left + diffX}px`
      }
      if(top > 0){
        // main.style.top = `${top + diffY}px`
      }
    }
    e.target.onmouseup = (e) => {
      console.log('抬起');
      isDragDown = false
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>nine</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* canvas background */}
      <canvas className={styles.canvas} ref={cvsRef}></canvas>

      <main className={styles.main} ref={mainRef} id="main">
        {manifestList.map((item, index) => (
          <div
            key={item.id}
            className={styles.manifest}
            id={item.id}
            style={{
              width: item.width,
              height: item.height,
              left: item.left,
              right: item.right,
              top: item.top,
              bottom: item.bottom,
            }}
            onClick={(event) => hanlderClickManifest(event)}
          >
            <div className={styles.header}>
              <span className={styles.close}>x</span>
              <span className={styles.drag} style={{cursor: isDragDown ? 'grabbing' : 'grab'}} onMouseDown={ (e) => hanlderManifestMouseDown(item,e) }></span>
            </div>
            <div className={styles.content}></div>
          </div>
        ))}
      </main>
    </div>
  );
}
