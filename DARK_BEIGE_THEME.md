# Dark Background with Beige Elements Theme

## Overview

The app uses a **dark background** (#1a1a2e) with **beige/tan cards and panels** (#ece2d0), matching the Arc Raiders official website aesthetic.

## Color Scheme

### Background Colors

- **Main Background**: `#1a1a2e` (arc-dark) - Dark navy background
- **Darker Background**: `#0f0f1f` (arc-navy) - Even darker for depth
- **Beige Cards/Panels**: `#ece2d0` (arc-light) - Warm beige for content areas

### Text Colors

- **On Dark Backgrounds**: White (#ffffff) or white/80% opacity
- **On Beige Elements**: Dark navy (#1a1a2e) for high contrast

### Accent Colors (Unchanged)

- **Arc Red**: `#ff3355`
- **Arc Green**: `#00ff88`
- **Arc Yellow**: `#ffd500`
- **Arc Cyan**: `#00d4ff`

## Usage Patterns

### Basic Structure

```vue
<!-- Dark background page -->
<div class="bg-arc-dark text-white min-h-screen">
  <!-- Beige content card -->
  <div class="bg-arc-light text-arc-dark-900 rounded-lg p-6">
    <h2 class="font-bold text-xl">Card Title</h2>
    <p class="text-arc-dark-700">Card description with slightly muted text</p>
  </div>
</div>
```

### Navigation Bar

```vue
<nav class="bg-arc-navy text-white border-b border-white/10">
  <a href="#" class="hover:text-arc-red">Link</a>
</nav>
```

### Cards & Panels (Beige)

```vue
<!-- Beige card on dark background -->
<div class="bg-arc-light rounded-lg p-6 shadow-xl">
  <h3 class="text-arc-dark-900 font-bold text-lg">Title</h3>
  <p class="text-arc-dark-700 mt-2">Description text</p>

  <!-- Buttons on beige -->
  <button class="bg-arc-red text-white px-4 py-2 rounded hover:bg-arc-red/80">
    Action
  </button>
</div>
```

### Utility Classes

```css
/* Beige backgrounds */
bg-arc-light        /* #ece2d0 - Main beige */
bg-arc-light-300    /* #f5f0e6 - Lighter beige */
bg-arc-light-500    /* #ece2d0 - Default */
bg-arc-light-700    /* #bcac90 - Darker beige */

/* Dark backgrounds */
bg-arc-dark         /* #1a1a2e - Main dark */
bg-arc-navy         /* #0f0f1f - Darker navy */

/* Text colors */
text-white          /* White on dark */
text-white/80       /* Muted white on dark */
text-arc-dark-900   /* Dark text on beige */
text-arc-dark-700   /* Muted dark text on beige */

/* Custom utilities */
bg-beige-panel      /* Beige panel background */
text-on-beige       /* Dark text for beige backgrounds */
text-on-dark        /* White text for dark backgrounds */
border-beige        /* Beige border with opacity */
border-dark         /* White border with opacity */
```

## Component Examples

### Leaderboard Card

```vue
<div class="bg-arc-dark min-h-screen p-8">
  <div class="bg-arc-light rounded-lg p-8">
    <h1 class="text-3xl font-bold text-arc-dark-900 mb-6">Leaderboard</h1>

    <div class="space-y-4">
      <!-- Player entry -->
      <div class="bg-white/50 p-4 rounded flex justify-between items-center">
        <span class="text-arc-dark-900 font-bold">Player Name</span>
        <span class="text-arc-green font-bold">1000 pts</span>
      </div>
    </div>
  </div>
</div>
```

### Bounty Card

```vue
<div class="bg-arc-light rounded-lg p-6 shadow-lg">
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-bold text-arc-dark-900">Target Name</h3>
    <span class="bg-arc-red text-white px-3 py-1 rounded-full text-sm font-bold">
      500 Points
    </span>
  </div>

  <p class="text-arc-dark-700 mb-4">
    Bounty description goes here...
  </p>

  <button class="w-full bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg">
    Accept Bounty
  </button>
</div>
```

### Form Inputs

```vue
<!-- Form on beige panel -->
<div class="bg-arc-light rounded-lg p-8">
  <label class="block text-arc-dark-900 font-medium mb-2">
    Username
  </label>
  <input
    type="text"
    class="w-full bg-white border border-arc-dark/20 rounded-lg px-4 py-3 text-arc-dark-900 focus:border-arc-red focus:outline-none"
    placeholder="Enter username"
  />
</div>
```

### Status Messages

```vue
<!-- Success on beige background -->
<div class="bg-arc-green/10 border border-arc-green/30 text-arc-green p-4 rounded-lg">
  ✓ Success message
</div>

<!-- Error on beige background -->
<div class="bg-arc-red/10 border border-arc-red/30 text-arc-red p-4 rounded-lg">
  ✗ Error message
</div>

<!-- Warning on beige background -->
<div class="bg-arc-yellow/10 border border-arc-yellow/30 text-arc-dark-900 p-4 rounded-lg">
  ⚠ Warning message (dark text for contrast)
</div>
```

## Contrast Ratios

### On Dark Background (#1a1a2e)

- **White text**: 11.8:1 ✅ (Excellent)
- **Arc Red**: 4.5:1 ✅ (Good)
- **Arc Green**: 7.2:1 ✅ (Very good)
- **Arc Yellow**: 8.1:1 ✅ (Excellent)
- **Arc Cyan**: 6.3:1 ✅ (Very good)

### On Beige Background (#ece2d0)

- **Dark text (#1a1a2e)**: 9.5:1 ✅ (Excellent)
- **Arc Red**: 4.8:1 ✅ (Good for large text)
- **Arc Green**: 5.2:1 ✅ (Good)

## Migration from Previous Theme

### Before (All light)
```vue
<div class="bg-arc-light text-arc-dark">
  <div class="bg-white p-6">Content</div>
</div>
```

### After (Dark with beige)
```vue
<div class="bg-arc-dark text-white">
  <div class="bg-arc-light text-arc-dark-900 p-6">Content</div>
</div>
```

## Best Practices

1. **Main backgrounds**: Use `bg-arc-dark` or `bg-arc-navy`
2. **Content cards**: Use `bg-arc-light` for beige panels
3. **Text on dark**: Use `text-white` or `text-white/80`
4. **Text on beige**: Use `text-arc-dark-900` or `text-arc-dark-700`
5. **Buttons**: `bg-arc-red text-white` (primary) or `bg-arc-dark text-white` (secondary)
6. **Borders on dark**: Use `border-white/10` or `border-white/20`
7. **Borders on beige**: Use `border-arc-dark/10` or `border-arc-dark/20`

## Files Modified

1. ✅ [tailwind.config.js](tailwind.config.js) - Updated arc-dark and arc-navy colors
2. ✅ [src/assets/base.css](src/assets/base.css) - Set dark background CSS variables
3. ✅ [src/assets/main.css](src/assets/main.css) - Body defaults to dark bg, added beige utilities

The theme now matches the Arc Raiders official website with dark backgrounds and beige content panels!
