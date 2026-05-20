# 🚀 XI TJKT 1 Class Portal — SMKN 1 Boyolali

A premium, interactive web application designed and built specifically for the students and administration of **Class XI TJKT 1** at **SMKN 1 Boyolali**. It features a modern, developer-themed dark UI, smooth animations, and full offline-first data persistence.

---

## 🛠️ Technology Stack

- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **Animations**: GSAP (GreenSock), Framer Motion, Anime.js
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Context API**: React Context for state management

---

## ✨ Features

### 🌟 For Public Users (No Login Required)
- **Interactive Landing Dashboard**: Modern "neofetch" CLI layout, system operational status logs, and real-time counter metrics.
- **Roster & Members**: A dynamic directory of class members featuring interactive profile cards that open a terminal-like profiling script mockup.
- **Assignments & Tasks**: Task checklist tracker grouped by priority (High, Medium, Low) and categories (Homework, Project, Exam).
- **Class Schedules**: Organized schedule for subjects and exam dates.
- **Gallery Archive**: Photo gallery log displaying class events.
- **Notes & Announcements**: Pinboard of class announcements, meeting notes, and homework guidelines.

### 🛡️ For Administrators (Passcode Secure)
- **Full Member Management**: Add, update, and delete members from the roster.
- **Global Settings Panel**: Toggle system theme accents and dynamic background types (Dot Matrix, Grid Matrix, Animated Gradient).
- **Local persistence**: Automatic synchronization of all modifications to browser `LocalStorage`.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (version 18 or above) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Snezhya/class-website.git
   cd class-website
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` to define your custom administrative passcode.

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Build the application for production deployment:
   ```bash
   npm run build
   ```

---

## 🔒 Security & Safety
- Administrative secrets are managed using environment variables (`.env`) and template defaults.
- All temporary artifacts, OS caches, editor parameters, and node dependency structures are excluded via `.gitignore`.
