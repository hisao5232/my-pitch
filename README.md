# MyPitch Dash ⚽️💻

自分専用の多機能ダッシュボード。サッカーのスケジュール管理、ガジェット管理、お気に入り動画などを一元管理することを目指した個人プロジェクトです。

## 🚀 Tech Stack

- **Frontend**: Next.js (Cloudflare Pages)
- **Styling**: Tailwind CSS v4
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Tooling**: Wrangler, TypeScript

## ✨ Features

- **Personal Calendar**: 自身のスケジュールを日ごとに管理。
- **Dark Mode UI**: エンジニア向けのクールなダークテーマを採用。
- **Real-time Updates**: 追加した予定が即座にカレンダーへ反映。
- **Responsive Design**: モバイル・デスクトップ両対応。

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Cloudflare Account & Wrangler CLI

### Installation
```bash
# Repository clone
git clone [https://github.com/hisao5232/my-pitch.git](https://github.com/hisao5232/my-pitch.git)
cd my-pitch

# Backend setup
cd backend
npm install
# Local DB setup
npx wrangler d1 execute my-pitch-db --local --file=./schema.sql
npm run dev

# Frontend setup
cd ../frontend
npm install
npm run dev
```

## 📂 Project Structure
- /frontend: Next.js アプリケーション
- /backend: Hono (API) & D1 設定
