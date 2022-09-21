import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getRandomId } from '../utils/tools'

export default function Home() {
  const cvsRef = useRef();
  const mainRef = useRef();
  let [ctx] = useState(null);
  let [isMouseDown] = useState(false);
  let [actveId, setActiveId] = useState(0);
  let [isDragDown, setDragDown] = useState(false);
  let [manifestList, setManifestList] = useState([]);
  let [cacheCreateManifestItem] = useState([{ x: 0, y: 0, width: 0, height: 0, left: null, right: null, top: null, bottom: null }]);
  let [initZIndex, setZIndex] = useState(1000)

  useEffect(() => {
    draw();
    watchWindow();
  }, []);

  // useEffect(() => {
  //   console.log('gaibianle', isDragDown);
  // }, [isDragDown])

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
  function hanlderClickManifest({id}) {
    setActiveId(id)
    manifestList.forEach( item => {
      if(item.id === id ){
        item.zIndex = initZIndex
        setZIndex(initZIndex + 1)
      }
    })
    setManifestList(manifestList)
  }

  /* 创建盒子 */
  function handlerMainMousedown(e) {
    e.stopPropagation()
    if (e.target.id !== 'main') return;
    const main = document.getElementById('main')
    main.style.cursor = "crosshair";
    /* 记录起始点 */
    const mousedownPoint = {};
    ({ clientX: mousedownPoint.x, clientY: mousedownPoint.y } = e);
    isMouseDown = true;
    const activeDiv = document.createElement("div");
    activeDiv.id = "createIn";
    activeDiv.style.backgroundColor = `#c4bebe80`;
    activeDiv.style.position = "absolute";
    activeDiv.style.zIndex = 99999;
    document.body.appendChild(activeDiv);

    document.onmousemove = (e) => {
      if (isMouseDown) {
        const { clientX, clientY } = e;
        const { x, y } = mousedownPoint;
        const activeDiv = document.getElementById("createIn");
        const diffX = clientX - x
        const diffY = clientY - y
        /* 判断四种方向下left top的不同坐标 */
        if (diffX > 0 && diffY > 0) {
          Object.assign(cacheCreateManifestItem, { left: x, top: y })
        }
        if (diffX > 0 && diffY < 0) {
          Object.assign(cacheCreateManifestItem, { left: x, top: clientY })
        }
        if (diffX < 0 && diffY > 0) {
          Object.assign(cacheCreateManifestItem, { left: clientX, top: y })
        }
        if (diffX < 0 && diffY < 0) {
          Object.assign(cacheCreateManifestItem, { left: clientX, top: clientY })
        }
        const { left, top } = cacheCreateManifestItem
        activeDiv.style.left = `${left}px`
        activeDiv.style.top = `${top}px`
        activeDiv.style.width = `${Math.abs(x - clientX)}px`;
        activeDiv.style.height = `${Math.abs(y - clientY)}px`;
        Object.assign(cacheCreateManifestItem, { width: Math.abs(x - clientX), height: Math.abs(y - clientY) })
      }
    };

    /* 抬起鼠标， */
    document.onmouseup = (e) => {
      main.style.cursor = "pointer";
      if (!isMouseDown) return
      const activeDiv = document.getElementById("createIn");
      if (!activeDiv) return
      document.body.removeChild(activeDiv)
      isMouseDown = false;
      const { width, height } = cacheCreateManifestItem
      if (width < 80 || height < 80) return;
      const id = getRandomId()
      setManifestList([...manifestList, ...[{ ...cacheCreateManifestItem, id, zIndex: initZIndex }]])
      setZIndex(initZIndex + 1)
      cacheCreateManifestItem.width = 0
      cacheCreateManifestItem.height = 0
      document.onmousemove = null
    };
  }

  /* 移动便签的同时更新数据 */
  function handlerUpdateManifest({ id }, x, y) {
    manifestList.forEach(item => {
      if (item.id === id) {
        item.left = x
        item.top = y
      }
    })
    setManifestList(manifestList)
  }

  /* 移动便签 */
  function hanlderManifestMouseDown(manifest, e) {
    hanlderClickManifest(manifest)
    const main = document.getElementById('main')
    main.style.cursor = "grabbing";
    e.stopPropagation()
    setDragDown(true)
    const { clientX, clientY } = e;
    const { id, left, top } = manifest
    const curManifest = document.getElementById(id)
    document.onmousemove = (e) => {
      const diffX = Math.floor((e.clientX - clientX) / 10) * 10
      const diffY = Math.floor((e.clientY - clientY) / 10) * 10
      const curX = left + diffX
      const curY = top + diffY
      curManifest.style.left = `${curX}px`
      curManifest.style.top = `${curY}px`
      handlerUpdateManifest(manifest, curX, curY)
    }
    document.onmouseup = (e) => {
      main.style.cursor = "pointer";
      setDragDown(false)
      document.onmousemove = null
    } 
  }

  /* 删除 */
  function handlerDelManifest({id},e){
    e.stopPropagation()
    const bool =  window.confirm("Are you sure you want to remove this memo?")
    if(!bool) return
    setManifestList(manifestList.filter( t=> t.id !== id))
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

      <main className={styles.main} ref={mainRef} id="main" onMouseDown={(e) => handlerMainMousedown(e)}>
        {manifestList.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.manifest} ${isDragDown && actveId === item.id ? `${styles.active}` : ''}`}
            id={item.id}
            style={{
              width: item.width,
              height: item.height,
              left: item.left,
              top: item.top,
              zIndex: item.zIndex
            }}
            onClick={() => hanlderClickManifest(item)}
          >
            <div className={styles.header}>
              <span className={styles.close}  onClick={(e) => handlerDelManifest(item,e)}>一</span>
              <span className={styles.drag}  style={{ cursor: isDragDown ? 'grabbing' : 'grab' }} onMouseDown={(e) => hanlderManifestMouseDown(item, e)}></span>
            </div>
            <div className={styles.content}>==={JSON.stringify(isDragDown)}</div>
          </div>
        ))}
      </main>
    </div>
  );
}
