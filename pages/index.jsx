import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getRandomId } from '../utils/tools'
import { getStorageItem, setStorageItem } from '../utils/storage'
import { TODOLIST, THEME, LIGHT, DARK, defaultTodo } from '../constants/index'

export default function Home() {
  const cvsRef = useRef();
  const mainRef = useRef();
  let [ctx] = useState(null);
  let [actveId, setActiveId] = useState(0);
  let [isDragDown, setDragDown] = useState(false);
  let [manifestList, setManifestList] = useState([]);
  let [cacheCreateManifestItem] = useState({ position: { left: null, top: null}, size: { width: 0, height: 0 }, zIndex: 0, text: "" });
  let [zIndex, setZIndex] = useState(1000)
  
  const minManifestWidth = 80
  const minManifestHeight = 80

  useEffect(() => {
    draw();
    init()
    watchWindow();
  }, []);


  /* 获取历史信息 */
  function init(){
    initThemeMode()
    const storageTodo = getStorageItem(TODOLIST) || []
    const manifestList = storageTodo.length ? storageTodo : defaultTodo
    if(manifestList.length) setZIndex(Math.max(...manifestList.map( t => t.zIndex)))
    setManifestList(manifestList)
  }

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
    const theme =  getStorageItem(THEME) || LIGHT
    const color = theme === LIGHT ? "#00000080" : "#ffffff66";
    for (let i = 0; i < hCount; i++) {
      for (let j = 0; j < wCount; j++) {
        drawPoint({ x: j * singel + 1, y: i * singel + 1 }, color);
      }
    }
  }

  /* 绘制点 */
  function drawPoint({ x, y }, color) {
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.rect(x, y, 1, 1);
    ctx.fill();
  }

  /* 监听窗口变化 */
  function watchWindow() {
    window.onresize = () => draw();
    window.addEventListener("keydown", handlerKeydown);
  }

  /*  */
  function handlerKeydown(e){
    if ((e.code === "KeyC" || e.keyCode === 67) && e.altKey) {
      return toggleTheme();
    }
    if ((e.code === "KeyR" || e.keyCode === 82) && e.altKey) {
      const bool = window.confirm('Are you sure you want to remove all to dos')
      if(!bool) return;
      setManifestList([])
      setStorageItem(TODOLIST, [])
      
    }
  }

  /* 点击便签 */
  function hanlderClickManifest({id}) {
    setActiveId(id)
    manifestList.forEach( item => {
      if(item.id === id ){
        item.zIndex = zIndex
        setZIndex(zIndex + 1)
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
    const activeDiv = document.createElement("div");
    activeDiv.id = "createIn";
    activeDiv.style.backgroundColor = `#c4bebe80`;
    activeDiv.style.position = "absolute";
    activeDiv.style.zIndex = 99999;
    document.body.appendChild(activeDiv);

    document.onmousemove = (e) => {
        const { clientX, clientY } = e;
        const { x, y } = mousedownPoint;
        const activeDiv = document.getElementById("createIn");
        if(!activeDiv) return
        const diffX = clientX - x
        const diffY = clientY - y
        /* 判断四种方向下left top的不同坐标 */
        if (diffX > 0 && diffY > 0) {
          Object.assign(cacheCreateManifestItem, { position: { left: x, top: y } })
        }
        if (diffX > 0 && diffY < 0) {
          Object.assign(cacheCreateManifestItem, { position: { left: x, top: clientY }})
        }
        if (diffX < 0 && diffY > 0) {
          Object.assign(cacheCreateManifestItem, { position: { left: clientX, top: y }})
        }
        if (diffX < 0 && diffY < 0) {
          Object.assign(cacheCreateManifestItem, { position: { left: clientX, top: clientY }})
        }
        const { left, top } = cacheCreateManifestItem.position
        activeDiv.style.left = `${left}px`
        activeDiv.style.top = `${top}px`
        activeDiv.style.width = `${Math.abs(x - clientX)}px`;
        activeDiv.style.height = `${Math.abs(y - clientY)}px`;
        Object.assign(cacheCreateManifestItem, { size: { width: Math.abs(x - clientX), height: Math.abs(y - clientY) }})
    };

    /* 抬起鼠标， */
    document.onmouseup = (e) => {
      document.onmousemove = null
      main.style.cursor = "pointer";
      const activeDiv = document.getElementById("createIn");
      if (!activeDiv) return
      document.body.removeChild(activeDiv)
      const { width, height } = cacheCreateManifestItem.size
      if (width < 80 || height < 80) return;
      const id = getRandomId()
      const updateData = [...manifestList, ...[{ ...cacheCreateManifestItem, id, zIndex: zIndex }]]
      setManifestList(updateData)
      setStorageItem(TODOLIST, updateData)
      setZIndex(zIndex + 1)
    };
  }

  /* 更新数据 */
  function handlerUpdateManifest({ id }, changeData) {
    const updateData = manifestList.map(item => {
      if (item.id === id) Object.assign( item, changeData)
      return item
    })
    setManifestList(updateData)
    setStorageItem(TODOLIST, manifestList)
  }

  /* 移动便签 */
  function hanlderManifestMouseDown(manifest, e) {
    hanlderClickManifest(manifest)
    const main = document.getElementById('main')
    main.style.cursor = "grabbing";
    e.stopPropagation()
    setDragDown(true)
    const { clientX, clientY } = e;
    const { id, position } = manifest
    const { left, top } = position
    const curManifest = document.getElementById(id)
    document.onmousemove = (e) => {
      const diffX = Math.floor((e.clientX - clientX) / 10) * 10
      const diffY = Math.floor((e.clientY - clientY) / 10) * 10
      let curX = left + diffX
      let curY = top + diffY
      curX < 0 && (curX = 0)
      curY < 0 && (curY = 0)
      const { innerHeight, innerWidth } = window
      curX > innerWidth - 80 && (curX = innerWidth - 80)
      curY > innerHeight - 80 && (curY = innerHeight - 80)
      curManifest.style.left = `${curX}px`
      curManifest.style.top = `${curY}px`
      handlerUpdateManifest(manifest, { position: { left: curX, top: curY }})
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
    const updateData = manifestList.filter( t=> t.id !== id)
    setManifestList(updateData)
    setStorageItem(TODOLIST, updateData)
  }

  /* 改变便签尺寸 */
  function handlerResizeManfest(e, manifest){
    e.stopPropagation()
    hanlderClickManifest(manifest)
    setDragDown(true)
    const main = document.getElementById('main')
    main.style.cursor = "nw-resize";
    const { clientX, clientY } = e
    const { id, size } = manifest
    const { width, height } = size
    const curManifest = document.getElementById(id)
    document.onmousemove = (e) => {
      const diffX = e.clientX - clientX
      const diffY = e.clientY - clientY
      const curWidth =  Math.floor(((width + diffX) < minManifestWidth ? minManifestWidth : width + diffX) / 10) * 10
      const curHeight = Math.floor(((height + diffY) < minManifestHeight ? minManifestHeight : height + diffY) / 10) * 10
      handlerUpdateManifest(manifest, { size: { width: curWidth, height: curHeight}})
      curManifest.style.width = `${curWidth}px`
      curManifest.style.height = `${curHeight}px`
    }
    document.onmouseup = (e) => {
      main.style.cursor = "pointer";
      setDragDown(false)
      document.onmousemove = null
    }
  }

  /* 编辑便签 */
  function hanlderEditManifest(e, manifest){
    handlerUpdateManifest(manifest, { text: e.target.value })
  }

  /* 初始化主题色 */
  function initThemeMode(){
    const body = document.querySelector("body");
    const storageTheme = getStorageItem(THEME)
    if(storageTheme){
      if (storageTheme === DARK) {
        body.classList.add(DARK);
        setStorageItem(THEME, DARK);
      } else {
        body.classList.remove(DARK);
        setStorageItem(THEME, LIGHT);
      }
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.classList.add(DARK);
      setStorageItem(THEME, DARK);
    }
  }

  /* 修改主题色 */
  function toggleTheme(){
    const body = document.querySelector("body");
    const themeMode =  getStorageItem(THEME)
    if (themeMode === LIGHT) {
      body.classList.add(DARK);
      setStorageItem(THEME, DARK);
    } else {
      body.classList.remove(DARK);
      setStorageItem(THEME, LIGHT);
    }
    draw()
  }
 

  return (
    <div className={styles.container}>
      <Head>
        <title>Todolist panel</title>
        <meta name="description" content="a quick to-do panel management tool" />
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
              width: item.size.width,
              height: item.size.height,
              left: item.position.left,
              top: item.position.top,
              zIndex: item.zIndex
            }}
            onClick={() => hanlderClickManifest(item)}
          >
            <div className={`${styles.header} ${isDragDown ? `${styles.header_active}` : ''}`}>
              <span className={styles.close}  onClick={(e) => handlerDelManifest(item,e)}>一</span>
              <span className={styles.drag}  style={{ cursor: isDragDown ? 'grabbing' : 'grab' }} onMouseDown={(e) => hanlderManifestMouseDown(item, e)}></span>
            </div>
            <textarea className={styles.input} style={{ cursor: isDragDown ? 'grabbing' : 'text' }}  onInput={ (e) => hanlderEditManifest(e, item)} value={item.text} placeholder="Try adding a to-do"></textarea>
            <div className={styles.resize} onMouseDown={ (e) => handlerResizeManfest(e,item)}></div>
          </div>
        ))}
      </main>
    </div>
  );
}
