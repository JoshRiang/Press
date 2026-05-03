# UI/UX Design Guidelines: Press

This document defines the visual language, design philosophy, and user experience patterns for the Press application. Adherence to these guidelines ensures a cohesive, professional, and commercial-grade product.

## 1. Design Philosophy: Cyber-Anatomical Minimalism

The overall vibe should blend high-tech developer tools (like VS Code) with clean fitness analytics. It must feel precise, modern, and non-intrusive.

*   **Focus:** Content (exercise data) and Visuals (3D model) take precedence.
*   **Space:** Generous use of whitespace (or "dark space") to reduce cognitive load.
*   **Precision:** Use of monospaced fonts for numbers to emphasize tracking accuracy.

---

## 2. Color Palette & Theming

We use a **Strict Dark Mode** as the default. The colors are inspired by the "Tokyo Night" developer theme, providing high contrast without eye strain.

### Core Colors (Tailwind CSS Generic Names)

| Role | Color Name | Hex (Approx) | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `slate-950` | `#020617` | Main application background. |
| **Surface** | `slate-900` | `#0f172a` | Cards, modals, navigation bars. |
| **Border** | `slate-800` | `#1e293b` | Subtle dividers, component borders. |
| **Text (Primary)** | `slate-100` | `#f1f5f9` | Headings, primary content. |
| **Text (Secondary)** | `slate-400` | `#94a3b8` | Descriptions, labels, muted info. |

### Accent Colors

| Role | Color Name | Hex (Approx) | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `sky-400` | `#38bdf8` | Buttons, active states, icons (Dev/Tech vibe). |
| **Muscle Active** | `red-500` | `#ef4444` | **Dynamic:** The highlight color for activated muscles in 3D. |
| **Muscle Default** | `slate-600` | `#475569` | **Dynamic:** The base color for inactive muscles in 3D. |

---

## 3. Typography

Fonts must be clean and legible. We use a two-font system.

*   **Primary Font (Sans-Serif): Inter** or **system-ui**
    *   *Usage:* Headings, navigation, body text.
    *   *Feel:* Modern, highly legible.
*   **Secondary Font (Monospace): JetBrains Mono** or **Fira Code**
    *   *Usage:* Input data (Reps, Weight, Time), database IDs, log timestamps.
    *   *Feel:* Tech-forward, emphasizes precision tracking.

---

## 4. UI Components & Imagery

### Aesthetics
*   **Glassmorphism:** Use subtle backdrop blurs (`backdrop-blur-sm`) on navigation docks and modals over the 3D scene to maintain context.
*   **Borders:** Prefer thin `1px` borders (`border border-slate-800`) over heavy box-shadows.
*   **Skeuomorphism:** Avoid gradients or pseudo-3D effects on 2D UI elements. Keep them flat.

### Components
*   **Buttons:** Highly responsive. Use primary accent (`sky-400`) for call-to-actions. Secondary buttons should be outlined.
*   **Cards:** Use `slate-900` surfaces with rounded corners (`rounded-2xl`).
*   **Inputs:** Clean, dark inputs. Monospace font for numerical inputs.

### Icons
*   Use a clean, outline-based icon set. Highly recommended: **Lucide React** or **Heroicons**. Keep icon color consistent (`slate-400` or `sky-400` for active).

---

## 5. Layout & Interaction Patterns

### Mobile-First
*   Since gym tracking happens on the floor, the primary experience must be optimized for mobile devices.
*   **Navigation:** Use a fixed **Bottom Navigation Dock** for easy thumb access.

### 3D Visualizer Integration
*   The 3D mannequin should feel integrated into the interface, not just a static image block.
*   **Active Highlighting:** When a user selects or hovers over a workout log entry, the corresponding muscle group on the 3D model must immediately pulse in **Active Red** (`red-500`).
*   **Transparency:** Use transparent backgrounds for the Three.js canvas so surface colors (`slate-950`) show through.

### Progressive Overload Integration (Engine)
*   **Contextual Suggestions:** When users are logging a workout (e.g. `newlog/page.tsx`), the interface must actively analyze their history and display "Progressive Overload Recommendations".
*   **Visual Distinction:** These algorithm-generated targets should be visually distinct (using `glow-border` and `sky-400/5` backgrounds) from standard static text to emphasize that they are intelligent, machine-calculated targets.

---

## 6. Claude Interaction Guidelines for Design

When instructing Claude to generate UI components, you must explicitly enforce these style rules.

### Example Prompt Pattern for UI Generation:

> "Claude, generate a React component for a **Workout Log Card** in Next.js.
>
> **Follow the `design.md` guidelines:**
> 1.  Use a **Dark Slate** palette (`slate-900` background, `slate-800` border, `rounded-2xl`).
> 2.  The Exercise Name should be `slate-100` sans-serif.
> 3.  The Set/Rep/Weight data (e.g., "3 x 10 @ 60kg") must use a **Monospace font** (JetBrains Mono) and be **Accent Sky Blue** (`sky-400`).
> 4.  Include an outline icon from Lucide React."