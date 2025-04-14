# Todolist 📝

<div align="center">

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-17.0.2-blue)
![Next.js](https://img.shields.io/badge/Next.js-12.3.1-black)
![Author](https://img.shields.io/badge/Author-Snine-orange)

一个优雅的Markdown支持的便签应用 | A elegant Markdown-supported todo sticky note application

[English](./README_EN.md) | 简体中文

![预览图](https://nine-1300678944.cos.ap-shanghai.myqcloud.com/todolist.png)

### [🔗 在线体验 Live Demo](https://todo.mmmss.com/)

</div>

## 📖 目录 (Table of Contents)

- [✨ 项目介绍](#-项目介绍)
- [🚀 功能特点](#-功能特点)
- [🛠️ 技术栈](#️-技术栈)
- [📦 安装与使用](#-安装与使用)
- [📝 使用指南](#-使用指南)
- [❓ 常见问题](#-常见问题)
- [🤝 贡献指南](#-贡献指南)
- [📃 许可证](#-许可证)
- [👨‍💻 关于作者](#-关于作者) 

## ✨ 项目介绍

Todolist是一个基于Next.js开发的网格便签应用，支持Markdown语法和实时预览。作为一款纯前端Web应用，它可以用作日常便签、待办事项或笔记本。无需后端支持，所有数据存储在本地，保护用户隐私。

最新版本增加了Markdown支持，类似Typora的实时编辑与预览体验，让便签内容更加丰富多样。

## 🚀 功能特点

- ✅ 支持Markdown语法，实时编辑预览
- ✅ 拖拽创建便签，随意调整大小和位置
- ✅ 支持明暗两种主题，自动适应系统主题
- ✅ 纯前端实现，数据存储在本地，保护隐私
- ✅ 格式化工具栏，便于快速编辑Markdown内容
- ✅ 快捷键支持（Alt+C切换主题，Alt+R清空所有便签）

![操作演示](https://nine-1300678944.cos.ap-shanghai.myqcloud.com/todolist.gif)

## 🛠️ 技术栈

- **框架**: [React](https://reactjs.org/) + [Next.js](https://nextjs.org/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **样式**: CSS Modules
- **存储**: LocalStorage

## 📦 安装与使用

### 前置条件

- Node.js 14.x 或更高版本
- npm 或 pnpm 包管理器

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/longyanjiang/todolist.git
cd todolist
```

2. 安装依赖
```bash
pnpm install
# 或
npm install
```

3. 本地运行
```bash
pnpm dev
# 或
npm run dev
```

4. 构建生产版本
```bash
pnpm build
# 或
npm run build
```

## 📝 使用指南

1. **创建便签**: 在任意空白区域拖动鼠标即可创建一个新便签。
   
2. **调整大小**: 点击右下角的调整按钮，拖动可改变便签大小（最小尺寸为80×80像素）。
   
3. **移动便签**: 点击便签顶部，鼠标会变为小手，按住拖动即可移动。
   
4. **编辑便签**: 点击便签内容区域进入编辑模式，支持Markdown语法。
   
5. **格式化工具**: 编辑时上方会显示格式化工具栏，可快速应用Markdown格式。
   
6. **切换主题**: 使用`Alt + C`快捷键切换明暗主题。
   
7. **清空便签**: 使用`Alt + R`快捷键一次性清除所有便签。

## ❓ 常见问题

### 是否支持移动端使用？

目前不支持在移动端使用。本应用主要为桌面环境设计，暂不考虑移动端的兼容。如果确实有这方面的需求，后续版本可能会考虑。

### 如何切换暗色主题？

默认情况下，应用会根据系统主题自动选择明暗模式。如需手动切换，请使用快捷键`Alt + C`。手动设置后，应用将不再跟随系统主题变化。

### 数据会上传到服务器吗？

不会。所有数据仅存储在浏览器的本地存储中，不会上传到任何服务器，可以完全离线工作。

## 🤝 贡献指南

欢迎所有形式的贡献，包括但不限于：

- 提交问题或功能请求
- 提交代码改进
- 改进文档

### 提交问题或Bug

请通过[GitHub Issues](https://github.com/longyanjiang/todolist/issues)提交问题，并尽可能提供以下信息：

- 详细的问题描述
- 复现步骤
- 浏览器和操作系统信息
- 相关的截图（如适用）

### 代码贡献

1. Fork本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 📃 许可证

本项目采用MIT许可证 - 详细信息请查看 [LICENSE](LICENSE) 文件。

## 👨‍💻 关于作者

- 博客： [小九的博客](https://jiangly.com)
- 掘金： [小九的掘金](https://juejin.cn/user/3861140568811576/posts)

---

如果您觉得这个项目有帮助，请给它一个⭐️！