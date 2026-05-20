# Project Requirements Document (PRD): XI TJKT 1 Class Platform

## 1. Project Overview
**Project Name:** XI TJKT 1 Class Portal  
**Target Audience:** Students, teachers, and administrators of the XI TJKT 1 (Networking & IT) vocational class.  
**Vision:** A high-fidelity, "student-developer" styled web platform that serves as both a public portfolio for the class and a functional CMS for internal management. The design emphasizes authenticity, networking culture, and modern frontend trends of 2026.

---

## 2. Design Identity
- **Primary Aesthetic:** "Dark Tech" / Developer Workspace.
- **Color Palette:** Deep Navy backgrounds (`#0b1326`), vibrant Blue accents (`#3b82f6`), and high-contrast terminal greens/cyans for status indicators.
- **Typography:** Inter (Sans-serif) for primary UI; Monospace (JetBrains Mono/Fira Code style) for terminal elements, code snippets, and system logs.
- **Visual Language:** Rounded corners (8px), subtle elevation shadows, glassmorphism (backdrop-blur) on navigation, and realistic terminal UI windows with window controls (red, yellow, green buttons).
- **Core Principle:** Avoid "AI-generated" looks (excessive gradients/floating shapes). Focus on practical, believable layouts used by startups and developers.

---

## 3. Functional Requirements

### 3.1 Public Interface
- **Landing Page:** Professional hero section with class mission and key statistics.
- **Member Directory (Split Hierarchy):**
    - **Core Team:** Highlighted cards for class leaders/officials.
    - **Full Roster:** A comprehensive list of all 35 students with searchable data.
- **Terminal Profile:** A unique "profile_inspect.sh" section using a Linux terminal UI to display detailed member biographies.
- **Gallery & Archive:** A grid-based repository for class events, competitions, and laboratory sessions.
- **Academics & Schedules:** Visual timeline or grid for class subjects and networking lab schedules.

### 3.2 Admin Console (CMS)
- **Authentication:** Terminal-styled login gateway (`auth_session_init.sh`).
- **Granular Management:**
    - **Member Management:** Separate controls for "Featured Members" and the "Full Roster."
    - **Asset Management:** Drag-and-drop media uploader for the gallery.
    - **Site Customization:** Real-time preview panel to adjust global theme colors, typography scale, and visibility of sections.
    - **System Health:** Dashboard metrics showing uptime, system logs, and recent admin activity.

---

## 4. Technical Constraints
- **Responsiveness:** Fully optimized for Desktop (primary) with mobile-friendly adjustments.
- **Interactivity:** Subtle hover states, smooth transitions, and GSAP-inspired motion for a premium feel.
- **Assets:** Use professional-grade placeholders (e.g., "Hu Tao" profile placeholder) that are easily swappable via the CMS.

---

## 5. Success Metrics
- **Authenticity:** Does the UI feel like it was built by a skilled student developer?
- **Utility:** Can an admin update the entire class roster without touching code?
- **Performance:** Maintain high visual fidelity without sacrificing load times or smooth animations.
