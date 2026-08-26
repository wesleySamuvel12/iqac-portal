# UI/UX Pro Max Guidelines & Rules

This project follows the **UI/UX Pro Max Design System** powered by Tailwind CSS, React, and Framer Motion. All agents working on this codebase MUST follow these design rules and implementation standards.

---

## 🎨 Design System & Visual Aesthetics

### 1. Palette & Theme Tokens
- **Primary Gradients**: Use curated multi-stop gradients (`from-emerald-600 via-teal-600 to-cyan-700`, `from-violet-700 via-purple-700 to-indigo-800`).
- **Surface & Cards**: Use glassmorphic surfaces (`bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5 rounded-2xl`).
- **Typography**: Use high-contrast font hierarchies:
  - Titles: `text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900`
  - Section Headers: `text-lg font-bold text-slate-800`
  - Subtitles / Badges: `text-xs font-bold uppercase tracking-wider text-slate-500`

---

## 🚀 Framer Motion & Animation Standards

### 1. Page & Container Entrances
- Always animate page hero elements and top sections:
```tsx
<motion.div 
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  ...
</motion.div>
```

### 2. Segmented Navigation & Sliding Tab Indicators
- Use `layoutId` on `motion.div` for active tab background pills to create smooth gliding indicator transitions:
```tsx
<div className="relative flex gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
  {tabs.map((tab) => {
    const isActive = activeTab === tab.id
    return (
      <motion.button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
      >
        {isActive && (
          <motion.div
            layoutId="activeTabIndicator"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200 -z-10"
          />
        )}
        <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? tab.activeColor : 'text-slate-400'}`} />
        <span>{tab.label}</span>
      </motion.button>
    )
  })}
</div>
```

### 3. Grid Card Hover & Stagger
- Use staggered entrance animations and hover lift effects for stat cards and metric panels:
```tsx
<motion.div 
  initial="hidden"
  animate="show"
  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
>
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -6, scale: 1.015 }}>
    <Card className="rounded-2xl border border-slate-200 bg-white/90 shadow-md hover:shadow-xl transition-all">
      ...
    </Card>
  </motion.div>
</motion.div>
```

### 4. Modals & Dialogs
- Wrap modals in `AnimatePresence` with scale and opacity animations:
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6"
      >
        ...
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🛠️ Data Visualization & Bar Charts
- **Vertical Bar Charts**: Always compute height as `style={{ height: height + '%' }}` inside `flex items-end` container to ensure vertical bar growth.
- **Icon Sizing**: Always append `shrink-0` and explicit dimension classes (`w-4 h-4` or `w-5 h-5`) to Lucide icons to prevent layout overflow.
- **Empty States**: Show informative empty states with icon highlights instead of blank white cards.
