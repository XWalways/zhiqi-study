# 知其所以 · 个人在线学习站（zhiqi-study）

零依赖多学科个人在线学习平台，采用单一源码仓库 + GitHub Actions 自动构建部署到 GitHub Pages，并内置 PWA 自动离线缓存。

## 学科目录结构

- **`/economy/`（经济基础）**：17 章完整内容（含 21 张交互/静态图解）
- **`/finance/`（金融基础）**：8 章完整内容（含 10 张交互/静态图解）
- **`/insurance/`（保险基础）**：6 章完整内容（含 10 张交互/静态图解）
- **`/computer/`（计算机科学）**：
  - `/computer/security/`（信息与网络安全，目录框架已就绪）
  - `/computer/database/`（数据库原理与实践，目录框架已就绪）
  - `/computer/network/`（计算机网络，目录框架已就绪）

## 核心特性

- **按学科独立路由 + 共享资源**：静态 CSS/JS 与图解脚本抽离至 `/assets/` 按需加载，彻底移除重复离线 HTML。
- **PWA 自动离线缓存**：内置 `manifest.webmanifest` 与 `sw.js`，访问过的章节断网也能直接打开学习。
- **章首思维导图 + 图文结合 + 即学即练**：每章开头提供可缩放思维导图，正文内嵌交互式/静态 SVG 图解与代码块一键复制，每个知识点后紧跟即学即练，并保留整章测试与错题复盘。
- **跨学科学习记录与旧版无缝迁移**：按 `zhiqi-study:v2:<course>:<chapter>` 命名空间保存进度，自动兼容迁移旧版 `zhiqi-study-v1` 记录，支持全站学习记录一键导出/导入。
- **旧链接平滑兼容**：构建时自动为原 `chapter01.html` ~ `chapter31.html` 生成轻量重定向页，老书签不会 404。

## 本地开发与新增课程

需 Node.js 22 及以上（无第三方依赖）：

```sh
npm run build
npm test
npm run preview
```

新增课程只需在 `courses/` 下创建对应目录（如 `courses/computer/os/`）放入 `course.json` 与 `chapters/`，并在 `courses/site.json` 中注册路由，推送到 `main` 分支后 GitHub Actions 会自动构建并部署到 GitHub Pages。
