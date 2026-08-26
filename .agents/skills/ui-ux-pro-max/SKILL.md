---
name: ui-ux-pro-max
description: Guidelines and best practices for modern UI/UX design with Framer Motion, glassmorphism, responsive layouts, and Tailwind CSS.
---

# UI/UX Pro Max Skill

Use this skill when designing, building, or refactoring user interfaces in this repository.

## Core Design Principles

1. **Aesthetics & Depth**: Use rich multi-stop gradients, glassmorphism (`backdrop-blur-xl bg-white/90`), layered card shadows (`shadow-lg shadow-slate-900/5`), and smooth rounded corners (`rounded-2xl`).
2. **Motion & Polish**: Use Framer Motion (`motion.div`, `AnimatePresence`, `layoutId`) for page entrances, hover lifts (`whileHover={{ y: -6, scale: 1.015 }}`), modal pop-ups, and sliding tab indicators.
3. **Typography Hierarchy**: Use high-contrast font weight scales (bold title headers, subtle uppercase tracking-wider sub-labels, clean pill badges).
4. **Data Visualization**: Ensure vertical bar charts scale height via `style={{ height: height + '%' }}` within `flex items-end` containers. Always set explicit `w-4 h-4 shrink-0` bounds on icons.
