# Lancsnetworks – Brand Style Reference

> Copy this file into the next chat as context so all styles are preserved exactly.

---

## 1. Brand Color Palette (Raw Hex)

| Token          | Hex       | Usage                                      |
|----------------|-----------|--------------------------------------------|
| Primary        | `#063986` | Sidebar bg, nav, focus rings, headings     |
| Accent         | `#E36C25` | CTAs, "Gửi báo cáo" buttons, active states |
| Secondary      | `#4CABEB` | Tags, secondary buttons, category chips    |
| Muted bg       | `#D1EEFF` | Section backgrounds, subtle fills          |
| Foreground     | `#150f54` | All body text, headings                    |
| Success        | `#22c55e` | RAG green, completion badges               |
| Danger         | `#ef4444` | RAG red, over-budget variance numbers      |
| Warning / RAG  | `#E36C25` | RAG amber (same as accent/brand orange)    |

---

## 2. globals.css — Full :root + .dark + @theme inline

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

/* Pulsing amber border for "Waiting for Review" cards */
@keyframes pulse-border {
  0%, 100% { border-color: rgb(251 191 36 / 1); box-shadow: 0 0 0 0 rgb(251 191 36 / 0.4); }
  50%       { border-color: rgb(251 191 36 / 0.6); box-shadow: 0 0 0 4px rgb(251 191 36 / 0); }
}
.animate-pulse-border {
  animation: pulse-border 2s ease-in-out infinite;
}

:root {
  /* ── Lancsnetworks Brand Palette ─────────────────────────────────────── */
  --background: oklch(1 0 0);              /* #ffffff clean white page bg    */
  --foreground: oklch(0.15 0.07 264);      /* #150f54 deep navy body text    */
  --card: oklch(1 0 0);                    /* #ffffff card surface           */
  --card-foreground: oklch(0.15 0.07 264);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.07 264);

  /* Primary: #063986 – deep brand blue */
  --primary: oklch(0.32 0.13 264);
  --primary-foreground: oklch(1 0 0);

  /* Action/Accent: #E36C25 – brand orange for CTAs */
  --accent: oklch(0.65 0.175 44);
  --accent-foreground: oklch(1 0 0);

  /* Secondary: #4CABEB – light blue for tags/buttons */
  --secondary: oklch(0.70 0.12 217);
  --secondary-foreground: oklch(1 0 0);

  /* Subtle section bg: #D1EEFF – extra light blue */
  --muted: oklch(0.95 0.025 220);
  --muted-foreground: oklch(0.42 0.04 264);

  /* Destructive / Danger: #ef4444 */
  --destructive: oklch(0.627 0.222 27.3);
  --destructive-foreground: oklch(1 0 0);

  /* Border: soft blue-slate */
  --border: oklch(0.9 0.015 220);
  --input: oklch(0.93 0.01 220);

  /* Ring: brand primary for focus states */
  --ring: oklch(0.32 0.13 264);

  /* ── Status semantic tokens ────────────────────────────────────────────── */
  --success: oklch(0.715 0.198 149.4);     /* #22c55e */
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.65 0.175 44);         /* #E36C25 brand orange */
  --warning-foreground: oklch(1 0 0);
  --danger: oklch(0.627 0.222 27.3);
  --danger-foreground: oklch(1 0 0);

  /* RAG colors */
  --rag-green: #22c55e;
  --rag-amber: #E36C25;
  --rag-red: #ef4444;

  /* Chart palette – brand-aligned */
  --chart-1: oklch(0.32 0.13 264);         /* primary blue         */
  --chart-2: oklch(0.65 0.175 44);         /* accent orange        */
  --chart-3: oklch(0.70 0.12 217);         /* secondary light blue */
  --chart-4: oklch(0.715 0.198 149.4);     /* success green        */
  --chart-5: oklch(0.627 0.222 27.3);      /* danger red           */

  --radius: 0.5rem;

  /* ── Sidebar: #063986 primary brand blue ──────────────────────────────── */
  --sidebar: oklch(0.32 0.13 264);
  --sidebar-foreground: oklch(0.96 0 0);
  --sidebar-primary: oklch(0.65 0.175 44); /* orange active state   */
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.38 0.11 264);  /* hover bg              */
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(0.27 0.1 264);
  --sidebar-ring: oklch(0.65 0.175 44);
}

.dark {
  --background: oklch(0.13 0.04 264);
  --foreground: oklch(0.95 0 0);
  --card: oklch(0.18 0.04 264);
  --card-foreground: oklch(0.95 0 0);
  --popover: oklch(0.18 0.04 264);
  --popover-foreground: oklch(0.95 0 0);
  --primary: oklch(0.45 0.13 264);
  --primary-foreground: oklch(1 0 0);
  --accent: oklch(0.70 0.175 44);
  --accent-foreground: oklch(1 0 0);
  --secondary: oklch(0.65 0.10 217);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.22 0.03 264);
  --muted-foreground: oklch(0.6 0 0);
  --destructive: oklch(0.627 0.222 27.3);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.28 0.05 264);
  --input: oklch(0.28 0.05 264);
  --ring: oklch(0.65 0.175 44);
  --success: oklch(0.715 0.198 149.4);
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.70 0.175 44);
  --warning-foreground: oklch(1 0 0);
  --danger: oklch(0.627 0.222 27.3);
  --danger-foreground: oklch(1 0 0);
  --rag-green: #22c55e;
  --rag-amber: #E36C25;
  --rag-red: #ef4444;
  --sidebar: oklch(0.1 0.04 264);
  --sidebar-foreground: oklch(0.92 0 0);
  --sidebar-primary: oklch(0.65 0.175 44);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.2 0.06 264);
  --sidebar-accent-foreground: oklch(0.92 0 0);
  --sidebar-border: oklch(0.16 0.04 264);
  --sidebar-ring: oklch(0.65 0.175 44);
}

@theme inline {
  --font-sans: 'Geist', 'Geist Fallback';
  --font-mono: 'Geist Mono', 'Geist Mono Fallback';
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-danger: var(--danger);
  --color-danger-foreground: var(--danger-foreground);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 3. layout.tsx — Font Setup

```tsx
import { Geist, Geist_Mono } from 'next/font/google'

const _geist     = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Body class: font-sans antialiased
```

---

## 4. Typography Rules

| Context                              | Font        | Class           |
|--------------------------------------|-------------|-----------------|
| All UI labels, headings, body text   | Geist Sans  | `font-sans`     |
| All numeric % and hours values       | Geist Mono  | `font-mono`     |
| Code, IDs, timestamps                | Geist Mono  | `font-mono`     |

---

## 5. Component Patterns

- **Primary button** – `bg-primary text-primary-foreground hover:bg-primary/90`
- **Accent/CTA button** – `bg-accent text-accent-foreground hover:bg-accent/90` (orange)
- **Ghost button** – `border border-border bg-transparent hover:bg-muted`
- **Over-budget variance** – `text-danger font-mono font-bold` (e.g. `+12h` in red)
- **Justification modal header** – `bg-accent/10 border-l-4 border-accent` (10% orange bg)
- **Success badge** – `bg-success/10 text-success border border-success/30`
- **Danger badge** – `bg-danger/10 text-danger border border-danger/30`
- **Sidebar** – `bg-sidebar text-sidebar-foreground`, active item uses `bg-sidebar-primary text-sidebar-primary-foreground`
- **Card** – `bg-card border border-border rounded-xl shadow-sm`

---

## 6. Exception / Constraint Rules

1. **Justification Modal** — triggers when `actualHours > plannedHours` on "Finish & Review" click.
2. **Finish & Review disabled** — when `progress < 100%`.
3. **Over Budget badge** — red badge on task card when actual > planned.
4. **At Risk border** — orange ring when SPI < 0.8.
5. **End-of-Day banner** — sticky footer after 17:30 if daily logged hours < 8h.
6. **Description minimum** — log work textarea requires ≥ 20 characters to submit.
