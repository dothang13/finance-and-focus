# ⚡ Finance & Focus (Zenith OS)

> **Minimalist Personal Life Operating System** combining **50/30/20 Personal Finance Management**, **Deep Focus Pomodoro Engine**, and **Procedural Ambient Soundscapes**.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Storage](https://img.shields.io/badge/Privacy-100%25%20Offline%20First-success)](https://github.com/dothang13/finance-and-focus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**Finance & Focus** (also known as **Zenith**) is a distraction-free, all-in-one personal productivity and finance dashboard designed to optimize your two most vital resources: **Money** and **Attention**.

Built with modern web technologies, Zenith runs entirely client-side with 100% local persistence and zero cloud tracking, delivering instant speed and complete data privacy.

---

## ✨ Key Features

### 💰 1. FinFlow — 50/30/20 Financial Management
- **Budgeting System**: Organizes cash flow according to the proven **50/30/20 rule** (50% Needs, 30% Wants, 20% Savings).
- **Monthly Finance Calendar**: Interactive calendar grid displaying daily income badges in blue (`+...`) and expenses in red (`-...`), complete with month/year navigation and 1-click day filtering.
- **Chronological Day-Grouped Transactions**: All transactions are sorted chronologically by date (newest first) and grouped by day with clean daily headers and income/expense subtotals.
- **Clean Number Formatting**: Human-friendly dot-separated amounts (e.g., `3.000.000đ`), clean typography without confusing slashed zeros.
- **1-Click Quick Expense Presets**: Instant logging for daily expenses (coffee, lunch, groceries, fuel, salary) with one click.
- **Independent Budget Allocation Advisor**: Enter monthly salary, rent, and utility costs to receive an instant recommended breakdown across food, transport, emergency savings, and flexible spending. Supports 1-click plan persistence to local storage.

### 🎯 2. StudyFlow & Deep Work Engine
- **Mechanical Flip Clock (Default)**: Authentic 3D mechanical split-flap countdown timer with smooth card-flip animations.
- **Digital-7 Segment Clock**: Authentic digital alarm clock display with beveled segment geometry, slanted italic styling, subtle unlit `88:88` background segments, and customizable LED colors (Default: Crisp White, with Cyan, Emerald, Amber, and Red options).
- **Zen Mode Fullscreen**: Giant countdown display filling the viewport with zero distraction and ESC exit.
- **Flexible Pomodoro Cadence**: 25/5m classic, 50/10m endurance, and 90m deep flow modes with subject attribution (Japanese N3, English, Deep Work).
- **Unified Daily Task Board**: Plan and filter tasks by date and study category with completion celebrations.
- **Vocabulary & Kanji Studio**: Track daily word counts with quick `+1/+5/+10` and `-1/-5` adjustment buttons, plus detailed word-logging with instant deletion for accidental clicks.

### 🎧 3. Procedural Soundscape & Binaural Beats (Web Audio API)
No external streaming latency or heavy audio files. Zenith synthesizes real-time soundscapes directly in your browser using the native Web Audio API:
- 🌧️ **Gentle Rain Lofi**: Filtered noise for soothing acoustic masking.
- 🧘 **432 Hz Natural Frequency**: Harmonic ambient tone for relaxation and stress relief.
- ✨ **528 Hz Solfeggio**: Frequency for mental clarity and positive flow states.
- 🧠 **Alpha Waves (10 Hz)**: Binaural beats for memory retention and active study.
- ⚡ **Gamma Waves (40 Hz)**: Binaural beats for high-level focus and deep coding.

### 📲 4. Privacy-First & Peer Device Sync
- **100% Offline-First**: All records are kept inside your local browser storage.
- **Instant QR Code Synchronization**: Transfer data between desktop and mobile devices seamlessly via QR code or JSON payload without relying on remote servers.

### 🖤 5. Obsidian & Raycast-Inspired Minimalist Aesthetics
- Sleek dark theme optimized for eye comfort during long focus sessions.
- Subtle, satisfying tactile audio feedback on clicks and completions.
- Responsive layout designed for desktop and mobile navigation.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Audio Synthesis** | Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (Oscillators, BiquadFilters, StereoPanner) |
| **Sync & Utility** | [QRCode](https://github.com/soldair/node-qrcode), [Canvas Confetti](https://github.com/catdad/canvas-confetti) |
| **Typography** | Inter, Orbitron, Digital-7 Mono (Local WOFF) |
| **Styling** | Vanilla Modern CSS (Design Tokens, Glassmorphism, CSS Grid & Flexbox) |

---

## 📂 Project Structure

```text
finance-and-focus/
├── public/
│   └── fonts/                      # Offline Digital-7 font files
├── src/
│   ├── components/
│   │   ├── BudgetAdvisorModal.jsx      # Monthly budget allocation calculator
│   │   ├── Dashboard.jsx               # Unified overview & streak tracker
│   │   ├── FinFlow.jsx                 # 50/30/20 Finance tracker
│   │   ├── FlipClock.jsx               # 3D Mechanical flip clock
│   │   ├── Header.jsx                  # Navigation & sound selector
│   │   ├── MonthlyFinanceCalendar.jsx  # Monthly financial calendar grid
│   │   ├── SevenSegmentClock.jsx       # Authentic 7-segment digital clock
│   │   ├── StreakModal.jsx         # Consistency streak settings
│   │   ├── StudyFlow.jsx           # Pomodoro timer, tasks & vocab studio
│   │   └── SyncModal.jsx           # Peer QR device sync
│   ├── utils/
│   │   ├── audio.js                # Web Audio API procedural sound engine
│   │   └── storage.js              # LocalStorage schema & backup helpers
│   ├── App.jsx                     # Root application
│   ├── index.css                   # Global theme tokens & component styles
│   └── main.jsx                    # React entry point
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dothang13/finance-and-focus.git
   cd finance-and-focus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** at `http://localhost:5173`.

---

## 📦 Production Build

To build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔒 Privacy Notice

**Finance & Focus** stores 100% of your data locally in your browser (`localStorage`). No tracking scripts, analytics, or external databases are involved.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

Developed with ❤️ by [Đỗ Thắng](https://github.com/dothang13).
