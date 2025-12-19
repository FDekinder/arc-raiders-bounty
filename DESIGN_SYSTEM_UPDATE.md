# Design System Update - Tactical/Angular Theme

Your Arc Raiders Bounty System now has a unique, tactical design system that sets it apart from generic AI-generated templates.

## 🎨 What Changed

### 1. **Angled Corners & Clip Paths**
All cards now have tactical, angular corners instead of boring rounded ones. This gives a more sci-fi/military feel.

### 2. **Custom Icon Set**
Replaced generic Lucide icons with custom-designed angular icons that match the game's aesthetic.

### 3. **Corner Brackets**
Optional tactical corner brackets on cards for that "HUD interface" feel.

### 4. **Tactical Buttons**
New button component with angled corners and animated corner accents.

---

## 📦 New Components

### 1. **Updated Card Component**

The `Card.vue` component now has angled corners and new variants:

```vue
<!-- Default angled card -->
<Card variant="default">
  Content here
</Card>

<!-- Angled card with subtle gradient line -->
<Card variant="angled">
  Content here
</Card>

<!-- Card with corner brackets (tactical HUD style) -->
<Card variant="bordered" :corners="true">
  Content here
</Card>

<!-- Hover effect -->
<Card :hover="true">
  Clickable content
</Card>
```

**Available variants:**
- `default` - Angled corners with subtle border
- `angled` - Angled corners with gradient top line
- `bordered` - Thick border with angled corners
- `glass` - Glassmorphism with angled corners
- `flat` - Minimal style with small angles

**New props:**
- `corners`: boolean - Shows tactical corner brackets (like a targeting HUD)

---

### 2. **Tactical Button Component**

New `TacticalButton.vue` with angled corners and corner accents:

```vue
<script setup>
import TacticalButton from '@/components/TacticalButton.vue'
import { Target } from 'lucide-vue-next'
</script>

<template>
  <!-- Primary button -->
  <TacticalButton variant="primary">
    Create Bounty
  </TacticalButton>

  <!-- With icon -->
  <TacticalButton variant="secondary">
    <template #icon>
      <Target :size="18" />
    </template>
    View Targets
  </TacticalButton>

  <!-- Danger button -->
  <TacticalButton variant="danger" size="lg">
    Delete
  </TacticalButton>

  <!-- Outline style -->
  <TacticalButton variant="outline" :fullWidth="true">
    Full Width Button
  </TacticalButton>
</template>
```

**Variants:**
- `primary` - Brown filled button
- `secondary` - Cyan accent button
- `danger` - Red accent button
- `ghost` - Transparent button
- `outline` - Border-only button

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

**Props:**
- `fullWidth`: boolean - Makes button full width
- `disabled`: boolean - Disabled state
- `type`: 'button' | 'submit' | 'reset'

---

### 3. **Custom Icon Components**

New angular icon set in `src/components/icons/`:

#### IconTarget.vue
```vue
<IconTarget :size="24" className="text-arc-cyan" />
```
Crosshair/target icon with angular frame.

#### IconBounty.vue
```vue
<IconBounty :size="24" className="text-arc-yellow" />
```
Hexagonal bounty/money icon.

#### IconHunter.vue
```vue
<IconHunter :size="24" className="text-arc-brown" />
```
Tactical helmet/visor icon.

#### IconTrophy.vue
```vue
<IconTrophy :size="24" className="text-arc-yellow" />
```
Trophy with angular base.

**Usage:**
```vue
<script setup>
import IconTarget from '@/components/icons/IconTarget.vue'
import IconBounty from '@/components/icons/IconBounty.vue'
</script>

<template>
  <div class="flex gap-4">
    <IconTarget :size="32" className="text-arc-red" />
    <IconBounty :size="32" className="text-arc-yellow" />
  </div>
</template>
```

---

## 🎯 How to Apply the New Design

### Example 1: Update a Bounty Card

**Before:**
```vue
<Card hover class="relative">
  <div class="flex items-center gap-4">
    <Target :size="24" class="text-arc-red" />
    <h3>{{ bounty.target_gamertag }}</h3>
  </div>
</Card>
```

**After:**
```vue
<Card variant="angled" hover :corners="true" class="relative">
  <div class="flex items-center gap-4">
    <IconTarget :size="24" className="text-arc-red" />
    <h3>{{ bounty.target_gamertag }}</h3>
  </div>
</Card>
```

---

### Example 2: Update Action Buttons

**Before:**
```vue
<RouterLink to="/create-bounty" class="btn-primary">
  + New Bounty
</RouterLink>
```

**After:**
```vue
<TacticalButton variant="primary" size="lg">
  <template #icon>
    <IconBounty :size="20" />
  </template>
  New Bounty
</TacticalButton>
```

---

### Example 3: Update Stats Cards

**Before:**
```vue
<div class="bg-arc-card rounded-lg p-4">
  <Trophy :size="32" class="text-arc-yellow mb-2" />
  <p class="text-2xl font-bold">{{ stats.total }}</p>
  <p class="text-sm">Total Bounties</p>
</div>
```

**After:**
```vue
<Card variant="bordered" :corners="true">
  <div class="text-center">
    <IconTrophy :size="32" className="text-arc-yellow mx-auto mb-2" />
    <p class="text-2xl font-bold">{{ stats.total }}</p>
    <p class="text-sm">Total Bounties</p>
  </div>
</Card>
```

---

## 🚀 Quick Migration Guide

### Step 1: Replace Icons (Optional but Recommended)

Find and replace common icons:

| Old (Lucide) | New (Custom) |
|-------------|-------------|
| `<Target />` | `<IconTarget />` |
| `<Trophy />` | `<IconTrophy />` |
| `<Users />` (for hunters) | `<IconHunter />` |

**Import changes:**
```vue
<!-- Old -->
import { Target, Trophy, Users } from 'lucide-vue-next'

<!-- New -->
import IconTarget from '@/components/icons/IconTarget.vue'
import IconTrophy from '@/components/icons/IconTrophy.vue'
import IconHunter from '@/components/icons/IconHunter.vue'
```

---

### Step 2: Update Cards

Add variants to existing cards:

```vue
<!-- Add variant for angled corners -->
<Card variant="angled">

<!-- Add corners for tactical brackets -->
<Card variant="bordered" :corners="true">
```

---

### Step 3: Replace Button Classes

Find buttons with classes like:
- `.btn-primary`
- `.btn-secondary`
- `.new-bounty-btn`

Replace with `TacticalButton` component.

---

## 🎨 Color Usage Guidelines

Your color palette remains the same. Use colors intentionally:

- **arc-cyan** (`#5fffff`) - Primary actions, links, highlights
- **arc-yellow** (`#dcca04ff`) - Rewards, bounties, achievements
- **arc-red** (`#ff0000`) - Danger actions, warnings, urgent items
- **arc-brown** (`#8b7355`) - Primary text, borders, main buttons
- **arc-green** (`#046b04ff`) - Success states, approved items

**Examples:**
```vue
<!-- Cyan for primary highlights -->
<IconTarget className="text-arc-cyan" />

<!-- Yellow for rewards/bounties -->
<IconBounty className="text-arc-yellow" />

<!-- Red for danger/targets -->
<span class="text-arc-red font-bold">WANTED</span>

<!-- Brown for main UI elements -->
<TacticalButton variant="primary">Action</TacticalButton>
```

---

## 💡 Design Philosophy

The new design follows these principles:

1. **Angular over Rounded** - Angled corners feel more tactical/military
2. **Function over Form** - Each element should feel purposeful
3. **Consistency** - All cards use the same clip-path angles
4. **Subtle Accents** - Corner brackets and lines add detail without clutter
5. **Game-Inspired** - UI feels like in-game interfaces

---

## 🔄 Gradual Migration

You don't need to update everything at once:

1. **High Priority** - Update main views (Home, Bounties, Leaderboard)
2. **Medium Priority** - Update form pages and modals
3. **Low Priority** - Update admin/verify pages

The old rounded cards still work, so you can mix old and new during migration.

---

## 📝 Advanced Customization

### Custom Clip Paths

You can create custom angled shapes in tailwind.config.js:

```js
clipPath: {
  'custom': 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
}
```

Then use in your components:
```vue
<div class="[clip-path:var(--clip-custom)]">
  Custom angled shape
</div>
```

### Creating More Custom Icons

Follow the pattern in existing icon components:

1. Use 24x24 viewBox
2. Use angled paths (avoid curves)
3. Accept `size` and `className` props
4. Use `currentColor` for stroke/fill
5. Keep stroke-width at 1.5 for consistency

---

## 🎯 Before & After Examples

### Home Page Hero
**Before:** Generic rounded cards with Lucide icons
**After:** Angled tactical cards with custom icons and corner brackets

### Bounty Cards
**Before:** Standard rounded rectangles
**After:** Angled corners with subtle gradient lines and optional brackets

### Buttons
**Before:** Solid rounded buttons
**After:** Angled tactical buttons with animated corner accents

---

## ✅ Checklist for Full Migration

- [ ] Update HomeView.vue with new cards and icons
- [ ] Update BountiesView.vue with TacticalButton and IconTarget
- [ ] Update LeaderboardView.vue with IconTrophy and angled cards
- [ ] Update CreateBountyView.vue with TacticalButton
- [ ] Update navigation buttons in App.vue
- [ ] Update LoginView.vue buttons
- [ ] Update modal components with angled cards
- [ ] Test mobile responsiveness with new clip-paths

---

## 🐛 Troubleshooting

### Clip-path not showing properly
- Ensure parent container has proper overflow (not `overflow-hidden`)
- Check that the element has defined width/height

### Icons not displaying
- Verify import path: `@/components/icons/IconName.vue`
- Check that SVG viewBox is `0 0 24 24`
- Ensure className prop is passed for color

### Corner brackets overlapping content
- Increase card padding
- Adjust z-index on .card-content

---

## 🎉 Result

Your bounty system now has:
✅ Unique, tactical aesthetic
✅ Angular shapes that match Arc Raiders' sci-fi theme
✅ Custom icon set
✅ Professional, polished look
✅ Stands out from generic templates

The design maintains your color palette while adding distinctive shapes and accents that make your site immediately recognizable and game-appropriate.
