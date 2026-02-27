**Read this in:** [English](README.md) | [日本語](README.ja.md) | 简体中文 | [繁體中文](README.zh-TW.md)

---

# 塞尔达时间线解读器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/demo-live-brightgreen)](https://zelda-timeline-interpreter.vercel.app)

> *献给那些多年来一直在争论《旷野之息》的位置、衰落时间线是否合理、以及《智慧的再现》对整体格局意味着什么的考据者们。*

一个为塞尔达考据社区打造的开源可视化时间线构建器。将游戏拖放到无限画布上，用分支路径连接它们，标注你的推理，并通过一个链接分享你的理论。

**[立即体验](https://zelda-timeline-interpreter.vercel.app)** -- 无需注册，无需后端，完全在浏览器中运行。

## 为什么做这个

塞尔达时间线是游戏界争论最多的话题之一。每部新作都会重新洗牌整个拼图。但大多数讨论都是以文字形式进行的 -- 论坛长帖、Reddit 帖子、YouTube 脚本 -- 没有简单的方式来*直观展示*你的观点。

这个工具为考据者提供了一个画布，让你能够可视化地构建自己的时间线版本。从官方时间线或空白画布开始，根据你的理论重新排列，绘制注释来突出关联，并导出为可分享的图片或链接。

## 功能

- **构建你的理论** -- 将全部 28 款游戏（21 款正传 + 7 款衍生）拖到画布上
- **分支时间线** -- 4 种颜色分支：主线（金色）、孩童（绿色）、成人（蓝色）、衰落（紫色）
- **标记关键事件** -- 在游戏之间添加事件节点，解释分裂和关联
- **自由标注** -- 使用画笔工具直接在画布上绘制，圈出、划线或连接想法
- **从官方时间线开始** -- 加载海拉尔百科/任天堂官方布局作为基础，然后修改
- **并排比较理论** -- 多标签页支持，同时处理多条时间线
- **一键分享** -- 导出为 PNG、PDF 或 JSON；通过 URL 分享，让他人查看和二次创作
- **智能对齐** -- 对齐参考线让布局保持整洁
- **全部可撤销** -- 完整的撤销/重做历史（Cmd+Z / Cmd+Shift+Z）
- **多语言支持** -- 英语、日语、简体中文、繁体中文

## 技术栈

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev) | UI 框架 |
| [Vite 7](https://vite.dev) | 构建工具 |
| [@xyflow/react](https://reactflow.dev) | 节点-边图可视化 |
| [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) | 带撤销/重做的状态管理 |
| [Tailwind CSS v4](https://tailwindcss.com) | 样式 |
| [i18next](https://www.i18next.com) | 国际化 |
| [Playwright](https://playwright.dev) | E2E 测试 |

## 快速开始

```bash
npm install
npm run dev        # 开发服务器 localhost:2104
npm run build      # 生产构建
npm run test:e2e   # Playwright E2E 测试
```

## 参与贡献

无论你想添加缺失的游戏、改进翻译、修复 bug，还是提出新功能 -- 来自塞尔达爱好者的贡献都非常欢迎。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
