# ⚡ Finance & Focus (Zenith OS)

> **Minimalist Personal Life Operating System** combining **50/30/20 Personal Finance Tracking**, **Deep Focus Workflows**, and **Procedural Ambient Soundscapes**.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Storage](https://img.shields.io/badge/Privacy-100%25%20Offline%20First-success)](https://github.com/dothang13/finance-and-focus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**Finance & Focus** (also known as **Zenith**) is a distraction-free, all-in-one personal dashboard designed to optimize your two most valuable daily resources: **Money** and **Attention**.

Built with modern web technologies and a focus on speed, aesthetics, and privacy, Finance & Focus works entirely client-side without locking your personal life behind third-party servers.

---

## ✨ Key Features

### 💰 1. FinFlow — 50/30/20 Financial Management
- **Budgeting Principle**: Automatically categorizes cash flow according to the proven **50/30/20 rule** (50% Needs, 30% Wants, 20% Savings & Investments).
- **Real-Time Cash Flow Metrics**: Instant overview of Total Income, Total Expenses, Net Savings, and Savings Rate.
- **Quick Logging**: Seamless transaction entry with instant balance updates and categorical insights.

### 🎯 2. StudyFlow & Deep Work Engine
- **Task & Goal Management**: Organize daily tasks, mark completions, and monitor productivity streaks.
- **Language & Skill Tracker**: Dedicated tracking for daily vocabulary / Kanji acquisition counters.
- **Streak & Gamification**: Maintain consistency with streak tracking and celebratory visual confetti triggers.

### 🎧 3. Procedural Soundscape & Binaural Beats (Web Audio API)
No bloated external MP3 streams or streaming latency. The built-in audio synthesizer generates real-time audio frequencies directly inside your browser:
- 🌧️ **Gentle Rain Lofi**: Filtered noise for soothing acoustic masking.
- 🧘 **432 Hz Natural Frequency**: Harmonic ambient tone for relaxation and stress relief.
- ✨ **528 Hz Solfeggio**: Known for mental clarity and positive flow states.
- 🧠 **Alpha Waves (10 Hz)**: Binaural beats designed for memory consolidation and active learning.
- ⚡ **Gamma Waves (40 Hz)**: Binaural beats engineered for peak concentration and deep coding sessions.

### 📲 4. Privacy-First & Peer Device Sync
- **100% Offline-First**: Your financial records and personal tasks reside strictly within your local browser storage.
- **Instant QR Code Synchronization**: Transfer data between desktop and mobile devices on the fly via QR code / JSON payload without storing anything on remote databases.

### 🖤 5. Obsidian-Inspired Minimalist Aesthetics
- Dark mode optimized for eye comfort during long focus intervals.
- Tactile audio feedback on UI actions.
- Fully responsive mobile navigation dock for on-the-go usage.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Audio Synthesis** | Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (Oscillators, BiquadFilters, StereoPanner) |
| **Sync & Utility** | [QRCode](https://github.com/soldair/node-qrcode), [Canvas Confetti](https://github.com/catdad/canvas-confetti) |
| **Styling** | Vanilla Modern CSS (Design Tokens, Glassmorphism, CSS Grid & Flexbox) |
| **Linter** | [Oxlint](https://oxc.rs/) |

---

## 📂 Project Structure

```text
finance-and-focus/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Brand logos & icons
│   ├── components/
│   │   ├── Dashboard.jsx   # Unified overview & daily metrics
│   │   ├── FinFlow.jsx     # 50/30/20 Finance tracker
│   │   ├── Header.jsx      # Navigation & sound selector
│   │   ├── StreakModal.jsx # Discipline streak modal
│   │   ├── StudyFlow.jsx   # Tasks, study sessions & learning counters
│   │   └── SyncModal.jsx   # QR-based device sync
│   ├── utils/
│   │   ├── audio.js        # Web Audio API sound synthesis engine
│   │   └── storage.js      # LocalStorage schema & sync helpers
│   ├── App.css             # Main layout styles
│   ├── App.jsx             # Root application & routing
│   ├── index.css           # Global design system & theme variables
│   └── main.jsx            # React entrypoint
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `pnpm` (or `npm`/`yarn`) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dothang13/finance-and-focus.git
   cd finance-and-focus
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser** and visit `http://localhost:5173`.

---

## 📦 Build for Production

To create an optimized production build:

```bash
pnpm build
# or
npm run build
```

Preview the production build locally:

```bash
pnpm preview
# or
npm run preview
```

---

## 🔒 Privacy Notice

**Finance & Focus** stores 100% of your data locally in your browser's `localStorage`. No analytics trackers, external cookies, or cloud sync servers are used. You maintain full ownership of your data at all times.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/dothang13/finance-and-focus/issues).

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

Developed with ❤️ by [Đỗ Thắng](https://github.com/dothang13).
