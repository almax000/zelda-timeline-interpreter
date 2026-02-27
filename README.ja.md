**Read this in:** [English](README.md) | 日本語 | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

---

# ゼルダ タイムライン インタープリター

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/demo-live-brightgreen)](https://zelda-timeline-interpreter.vercel.app)

> *ブレス オブ ザ ワイルドの位置づけ、衰退の時系列の妥当性、エコーズ オブ ウィズダムが全体に与える影響について議論し続けてきた考察者たちへ。*

ゼルダの考察コミュニティのために作られた、オープンソースのビジュアルタイムラインビルダーです。無限キャンバスにゲームをドラッグし、分岐パスで接続し、考察を書き込み、リンク一つで共有できます。

**[今すぐ試す](https://zelda-timeline-interpreter.vercel.app)** -- 登録不要、バックエンド不要、すべてブラウザ上で動作します。

## このツールが存在する理由

ゼルダの時系列は、ゲーム界で最も議論されるテーマの一つです。新作が出るたびにパズルが組み替わります。しかし、ほとんどの議論はテキストで行われ -- フォーラムの長文投稿、Redditスレッド、YouTubeの台本 -- 自分の考えを*視覚的に示す*簡単な方法がありませんでした。

このツールは、考察者がタイムラインの自分なりのビジョンを視覚的に構築するためのキャンバスを提供します。公式タイムラインまたは白紙のキャンバスから始め、自分の考察に合わせて並べ替え、注釈を描いて関連性を強調し、共有可能な画像やリンクとしてエクスポートできます。

## できること

- **自分の考察を構築** -- 全28作品（メインシリーズ21本 + スピンオフ7本）をキャンバスにドラッグ
- **タイムラインを分岐** -- 4色の分岐タイプ：メイン（ゴールド）、子供（グリーン）、大人（ブルー）、敗北（パープル）
- **重要なイベントを記録** -- ゲーム間にイベントノードを追加して分岐や接続を説明
- **自由に注釈** -- ペンツールでキャンバスに直接描画し、丸で囲んだり下線を引いたりアイデアを繋げたり
- **公式タイムラインから開始** -- ハイラル百科 / Nintendo公式レイアウトをベースに読み込み、変更を加える
- **考察を並べて比較** -- マルチタブ対応で複数のタイムラインを同時に作業
- **ワンクリックで共有** -- PNG、PDF、JSONでエクスポート；URLで共有して他の人が閲覧・リミックス
- **グリッドにスナップ** -- スマートな整列ガイドでレイアウトを整える
- **すべて取り消し可能** -- 完全なUndo/Redo履歴（Cmd+Z / Cmd+Shift+Z）
- **あなたの言語で** -- 英語、日本語、簡体中国語、繁体中国語

## 技術スタック

| 技術 | 用途 |
|------|------|
| [React 19](https://react.dev) | UIフレームワーク |
| [Vite 7](https://vite.dev) | ビルドツール |
| [@xyflow/react](https://reactflow.dev) | ノード・エッジのグラフ可視化 |
| [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) | Undo/Redo付き状態管理 |
| [Tailwind CSS v4](https://tailwindcss.com) | スタイリング |
| [i18next](https://www.i18next.com) | 国際化 |
| [Playwright](https://playwright.dev) | E2Eテスト |

## クイックスタート

```bash
npm install
npm run dev        # 開発サーバー localhost:2104
npm run build      # プロダクションビルド
npm run test:e2e   # Playwright E2Eテスト
```

## コントリビューション

ゲームの追加、翻訳の改善、バグ修正、新機能の提案など -- ゼルダファンからのコントリビューションを歓迎します。ガイドラインは[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

## ライセンス

[MIT](LICENSE)
