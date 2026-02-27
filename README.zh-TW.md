**Read this in:** [English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | 繁體中文

---

# 薩爾達時間線解讀器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/demo-live-brightgreen)](https://zelda-timeline-interpreter.vercel.app)

> *獻給那些多年來一直在爭論《曠野之息》的位置、衰落時間線是否合理、以及《智慧的再現》對整體格局意味著什麼的考據者們。*

一個為薩爾達考據社群打造的開源視覺化時間線建構器。將遊戲拖放到無限畫布上，用分支路徑連接它們，標註你的推理，並透過一個連結分享你的理論。

**[立即體驗](https://zelda-timeline-interpreter.vercel.app)** -- 無需註冊，無需後端，完全在瀏覽器中運行。

## 為什麼做這個

薩爾達時間線是遊戲界爭論最多的話題之一。每部新作都會重新洗牌整個拼圖。但大多數討論都是以文字形式進行的 -- 論壇長文、Reddit 帖子、YouTube 腳本 -- 沒有簡單的方式來*直觀展示*你的觀點。

這個工具為考據者提供了一個畫布，讓你能夠視覺化地構建自己的時間線版本。從官方時間線或空白畫布開始，根據你的理論重新排列，繪製註釋來突出關聯，並匯出為可分享的圖片或連結。

## 功能

- **構建你的理論** -- 將全部 28 款遊戲（21 款正傳 + 7 款衍生）拖到畫布上
- **分支時間線** -- 4 種顏色分支：主線（金色）、孩童（綠色）、成人（藍色）、衰落（紫色）
- **標記關鍵事件** -- 在遊戲之間新增事件節點，解釋分裂和關聯
- **自由標註** -- 使用畫筆工具直接在畫布上繪製，圈出、劃線或連接想法
- **從官方時間線開始** -- 載入海拉爾百科/任天堂官方佈局作為基礎，然後修改
- **並排比較理論** -- 多分頁支援，同時處理多條時間線
- **一鍵分享** -- 匯出為 PNG、PDF 或 JSON；透過 URL 分享，讓他人查看和二次創作
- **智慧對齊** -- 對齊參考線讓佈局保持整潔
- **全部可復原** -- 完整的復原/重做歷史（Cmd+Z / Cmd+Shift+Z）
- **多語言支援** -- 英語、日語、簡體中文、繁體中文

## 技術棧

| 技術 | 用途 |
|------|------|
| [React 19](https://react.dev) | UI 框架 |
| [Vite 7](https://vite.dev) | 建構工具 |
| [@xyflow/react](https://reactflow.dev) | 節點-邊圖視覺化 |
| [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) | 帶復原/重做的狀態管理 |
| [Tailwind CSS v4](https://tailwindcss.com) | 樣式 |
| [i18next](https://www.i18next.com) | 國際化 |
| [Playwright](https://playwright.dev) | E2E 測試 |

## 快速開始

```bash
npm install
npm run dev        # 開發伺服器 localhost:2104
npm run build      # 生產建構
npm run test:e2e   # Playwright E2E 測試
```

## 參與貢獻

無論你想新增缺失的遊戲、改進翻譯、修復 bug，還是提出新功能 -- 來自薩爾達愛好者的貢獻都非常歡迎。詳見 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授權

[MIT](LICENSE)
